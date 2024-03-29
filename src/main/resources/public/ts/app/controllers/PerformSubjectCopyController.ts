import { ng, model, Behaviours, notify, ObjectGuard, navigationGuardService, IObjectGuardDelegate } from 'entcore';
import { IGrainCopy, ISubject, IGrain, IGrainScheduled, ISubjectScheduled, ISubjectCopy } from '../models/domain';
import { 
    ISubjectService, ISubjectLibraryService, ISubjectCopyService, ICorrectionService,
    IGrainCopyService, IGrainService, IGrainScheduledService, ISubjectScheduledService, IGrainTypeService, IAccessService 
} from '../services';
import { angular } from 'entcore';
import * as rx from 'rxjs';

type IGrainCopyTask = {
    operation: "add" | "update",
    grain: IGrainCopy,
    done: "waiting" | "success" | "failed"
}

class PerformSubjectCopyController implements IObjectGuardDelegate {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectLibraryService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainService',
        'GrainScheduledService',
        'GrainCopyService',
        'GrainTypeService',
        'AccessService',
        'CorrectionService'
    ];

    private _subjectScheduled:ISubjectScheduled;
    private _subjectCopy:ISubjectCopy;
    private _grainCopyList:IGrainCopy[];
    private _grainScheduledList:IGrainScheduled[];
    private _previewing:boolean;
    private _previewingFromLibrary:boolean;
    private _previewFromReader:boolean;
    private _hasDataLoaded:boolean;
    private _isCanSubmit:boolean;
    private _currentGrainCopy:IGrainCopy;
    private _lockTasks = false;
    private _pendingTasks:IGrainCopyTask[] = [];
    private _pendingEdit:IGrainCopy[] = [];
    private _grainStreams = new Map<number, rx.Subject<IGrainCopy>>();
    private _subscriptions = new Array<rx.Subscription>();
    public shouldShowNavigationAlert:boolean;
    public saving = false;
    private _previewMode = false;

    constructor
    (
        private _$routeParams,
        private _$scope,
        private _$location,
        private _subjectService:ISubjectService,
        private _subjectLibraryService:ISubjectLibraryService,
        private _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _grainService:IGrainService,
        private _grainScheduledService:IGrainScheduledService,
        private _grainCopyService:IGrainCopyService,
        private _grainTypeService:IGrainTypeService,
        private _accessService:IAccessService,
        private _correctionService:ICorrectionService,
    ) {
        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectLibraryService = _subjectLibraryService;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService =_subjectCopyService;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;
        this._accessService = _accessService;
        this._correctionService = _correctionService;
        this._hasDataLoaded = false;
        this._isCanSubmit = true;
        //init guard
        const guard = new ObjectGuard(()=>this); 
        const guardId = navigationGuardService.registerIndependantGuard(guard);
        _$scope.$on('$destroy', () => {
            navigationGuardService.unregisterIndependantGuard(guardId);            
            this._subscriptions.forEach((value)=>{
                value.unsubscribe();
            })
            this._subscriptions = []
        })
        //
        
        var self = this,
            subjectId = _$routeParams['subjectId'],
            subjectCopyId = _$routeParams['subjectCopyId'];
        this._previewMode = ((this._$location && this._$location.url())+"").indexOf("preview") > -1;
        if (!angular.isUndefined(subjectId)) {
            this._subjectService.resolve().then(function() {
                var subject = self._subjectService.getById(subjectId);

                if(subject && model.me.hasRight(subject, 'owner')){
                } else if(subject && model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager)){
                } else if(subject && model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.contrib)){
                } else{
                    self._accessService.reader = true;
                }

                self._previewFromReader = !!self._accessService.reader;
                if (!angular.isUndefined(subject)) {
                    self._preview(subject);
                } else if (!angular.isUndefined(self._subjectLibraryService.tmpSubjectForPreview)) {
                    self._previewingFromLibrary = true;
                    self._preview(self._subjectLibraryService.tmpSubjectForPreview);
                } else {
                    self._$location.path('/dashboard');
                }

            }, function(err) {
                notify.error(err);
            });

        } else {
            if (!angular.isUndefined(subjectCopyId)) {
                this._perform(subjectCopyId);
            } else {
                self._$location.path('/dashboard');
            }
        }

    }

    guardObjectIsDirty(): boolean {
        //if preview => do not try to save
        if(this._previewMode){
            console.debug("preview mode skip save: ", this._previewMode);
            return false;
        }
        if (this.grainCopyList) {
            this._pendingEdit = this.grainCopyList.filter((e)=>e.getTracker().status=='editing');
            return this._pendingTasks.length > 0 || this._pendingEdit.length > 0;
        }
        return false;
    }

    guardObjectReset(): void {
        this._pendingTasks = [];
        this._pendingEdit = []
    }

    guardOnUserConfirmNavigate(canNavigate:boolean):void{
        setTimeout(()=>{
            //if pending task already done => display notification
            if(!canNavigate && this._pendingTasks.length == 0 && this._pendingEdit.length == 0){
                notify.success("exercizer.navigation.success");
                return;
            }
            //else perfom tasks
            if(!canNavigate && this._pendingTasks.length > 0){
                this.shouldShowNavigationAlert = false;
                this._$scope.$apply();
                //keep open at least 750ms
                setTimeout(() => {
                    this.saveDirtySubject();
                    this._$scope.$apply();
                }, 750)
            }
            if(!canNavigate && this._pendingEdit.length > 0){
                this.shouldShowNavigationAlert = false;
                this._$scope.$apply();
                let done = 0;
                const count = this._pendingEdit.length;
                for(const grain of this._pendingEdit){
                    this._handleUpdateGrainCopy(grain, (ok)=>{
                        done++;
                        if(done == count){
                            notify.success("exercizer.navigation.success");
                            this.closeNavigationAlert();
                            this._$scope.$apply();
                        }
                    });
                }
                this._pendingEdit = [];
            }
        });
    }

    closeNavigationAlert():void{
        this.shouldShowNavigationAlert = false;
        setTimeout(()=>{
            this._$scope.$apply();
        })
    }

    canCloseNavigationAlert():boolean{
        return !this.shouldShowNavigationAlert;
    }

    saveDirtySubject():void{
        this._lockTasks = true;
        const tryFinish = () => {
            const pending = this._pendingTasks.filter(t => t.done == "waiting");
            if(pending.length == 0){
                const failed = this._pendingTasks.filter(t => t.done == "failed");
                if(failed.length > 0){
                    notify.error("exercizer.navigation.error");
                }else{
                    notify.success("exercizer.navigation.success");
                }
                this.closeNavigationAlert();
                this._pendingTasks = [];
                this._lockTasks = false;
                this._$scope.$apply();
            }
        }
        for(const task of this._pendingTasks){
            this._handleUpdateGrainCopy(task.grain, (event)=>{
                task.done = event.ok?"success":"failed";
                tryFinish();
            });
        }
        tryFinish();
    }

    private _preview(subject:ISubject) {
        var self = this;
        this._previewing = true;

        this._grainService.getListBySubject(subject).then(
            function(grainList) {
                //calculate max score
                subject.max_score = 0;
                angular.forEach(grainList, function(grain:IGrain) {
                    if (grain.grain_type_id > 3) {
                        subject.max_score += grain.grain_data.max_score;
                    }
                });

                self._subjectScheduled = self._subjectScheduledService.createFromSubject(subject);
                self._subjectScheduled.id = Math.floor(Math.random() * (999999999 - 1)) + 1;

                self._subjectCopy = self._subjectCopyService.createFromSubjectScheduled(self._subjectScheduled);
                self._subjectCopy.id = Math.floor(Math.random() * (999999999 - 1)) + 1;

                self._grainScheduledList = self._grainScheduledService.createGrainScheduledList(grainList);
                angular.forEach(self._grainScheduledList, function(grainScheduled:IGrainScheduled) {
                    grainScheduled.id = Math.floor(Math.random() * (999999999 - 1)) + 1;
                    grainScheduled.subject_scheduled_id = self._subjectScheduled.id;
                });

                self._grainCopyList = self._grainCopyService.createGrainCopyList(self._grainScheduledList);
                self._$scope.$emit('E_GRAIN_COPY_LIST', self._grainCopyList);
                angular.forEach(self._grainCopyList, function(grainCopy:IGrainCopy) {
                    grainCopy.id = Math.floor(Math.random() * (999999999 - 1)) + 1;
                    grainCopy.subject_copy_id = self._subjectCopy.id;
                });

                self._eventsHandler(self);
                self._hasDataLoaded = true;
            },
            function(err) {
                notify.error(err);
            }
        );

    }

    private _perform(subjectCopyId:number) {
        var self = this;
        this._previewing = false;
        this._previewingFromLibrary = false;

        this._subjectScheduledService.resolve(false).then(
            function() {
                self._subjectCopyService.resolve(false).then(
                    function() {
                        self._subjectCopy = self._subjectCopyService.getById(subjectCopyId);

                        if (!angular.isUndefined(self._subjectCopy)) {

                            self._subjectScheduled = self._subjectScheduledService.getById(self._subjectCopy.subject_scheduled_id);

                            if (!angular.isUndefined(self._subjectScheduled)) {

                                if (self._subjectCopyService.canPerformACopyAsStudent(self._subjectScheduled, self._subjectCopy)) {

                                    self._grainCopyService.getListBySubjectCopy(self._subjectCopy).then(
                                        function(grainCopyList:IGrainCopy[]) {

                                            if (!angular.isUndefined(grainCopyList)) {
                                                self._subjectCopyService.checkIsNotCorrectionOnGoingOrCorrected(subjectCopyId).then(function (isOk) {
                                                    if (self._subjectCopy.current_grain_id) {
                                                        var currentGrainCopy = grainCopyList.find(grainCopy => grainCopy.id == self._subjectCopy.current_grain_id);
                                                        self._currentGrainCopy = currentGrainCopy;
                                                        self._currentGrainCopyChanged(currentGrainCopy);
                                                    }
                                                    self._isCanSubmit = isOk === true;
                                                    self._grainCopyList = grainCopyList;
                                                    self._$scope.$emit('E_GRAIN_COPY_LIST', self._grainCopyList);
                                                    self._eventsHandler(self);
                                                    self._hasDataLoaded = true;
                                                });
                                            } else {
                                                self._$location.path('/dashboard');
                                            }

                                        },
                                        function(err) {
                                            notify.error(err);
                                        }
                                    )

                                } else {
                                    self._$location.path('/dashboard');
                                }

                            } else {
                                self._$location.path('/dashboard');
                            }

                        } else {
                            self._$location.path('/dashboard');
                        }

                    },
                    function(err) {
                        notify.error(err);
                    }
                )
            },
            function(err) {
                notify.error(err);
            }
        );
    }

    private _currentGrainCopyChanged(grainCopy:IGrainCopy) {
        this._$scope.$emit('E_CURRENT_GRAIN_COPY_CHANGE', grainCopy);
        this._$scope.$broadcast('E_CURRENT_GRAIN_COPY_CHANGE', grainCopy);
    }
    private _handleUpdateGrainCopy(grainCopy:IGrainCopy, onSave?:({ok:boolean, grain: IGrain})=>void) {
        const task : IGrainCopyTask = {done: "waiting", grain: grainCopy, operation: "update"}; 
        if(!this._lockTasks){
            this._pendingTasks.push(task);
        }
        this.saving = true;
        grainCopy.getTracker().onStop();
        this._grainCopyService.update(grainCopy).then(
            () => {
                this._pendingTasks = this._pendingTasks.filter(t=> t!== task);
                this.saving = false;
                onSave && onSave({ok:true, grain: grainCopy});
                this._updateLocalGrainCopyList(grainCopy);
                grainCopy.getTracker().onFinish(true);
            },
            (err) => {
                notify.error(err);
                this.saving = false;
                onSave && onSave({ok:false, grain: grainCopy});
                grainCopy.getTracker().onFinish(false);
            }
        );
    }
    private _updateLocalGrainCopyList(grainCopy:IGrainCopy) {
        var grainCopyIndex = this._grainCopyList.indexOf(grainCopy);

        if (grainCopyIndex !== -1) {
            this._grainCopyList[grainCopyIndex] = grainCopy;
        }
    }

    private _eventsHandler = function(self:PerformSubjectCopyController) {
        const getDebouncedGrainStream = (grain:IGrainCopy) => {
            if(!self._grainStreams.has(grain.id)){
                const observable = new rx.Subject<IGrainCopy>();
                self._grainStreams.set(grain.id, observable);
                self._subscriptions.push(observable.debounceTime(500).subscribe((grain)=>{
                    self._handleUpdateGrainCopy(grain);
                }));
            }
            return self._grainStreams.get(grain.id);
        }
        self._$scope.$on('E_UPDATE_GRAIN_COPY', function(event, grainCopy:IGrainCopy) {
            if (!self._previewing) {
                //debounce
                //self._handleUpdateGrainCopy(grainCopy);
                getDebouncedGrainStream(grainCopy).next(grainCopy);
            } else {
                self._updateLocalGrainCopyList(grainCopy);
            }
        });

        self._$scope.$on('E_CURRENT_GRAIN_COPY_CHANGED', function(event, grainCopy:IGrainCopy) {
            self._currentGrainCopy = grainCopy;
            self._currentGrainCopyChanged(grainCopy);
        });

        self._$scope.$on('E_SUBJECT_COPY_SUBMITTED', function(event, subjectCopy:ISubjectCopy) {
            let selfSubjectCopy:any = subjectCopy;
            self._subjectCopyService.checkIsNotCorrectionOnGoingOrCorrected(subjectCopy.id).then(function (isOk) {
                if (isOk !== true) {
                    self._isCanSubmit = false;
                    notify.error("exercizer.check.corrected");
                    self._$scope.$broadcast('E_SUBMIT_SUBJECT_ERROR');
                } else {
                    var subjectCopy:ISubjectCopy = self._subjectCopyService.getById(selfSubjectCopy.id);
                    subjectCopy.submitted_date = new Date().toISOString();
                    self._subjectCopyService.submit(subjectCopy).then(
                        function (subjectCopy:any) {
                            subjectCopy.dueDate = selfSubjectCopy.dueDate;
                            if (subjectCopy.is_training_copy) {
                                let subjectScheduled = self._subjectScheduledService.getById(subjectCopy.subject_scheduled_id);
                                self._correctionService.automaticCorrectionForTraining(subjectCopy, subjectScheduled).then((subjectCopy:ISubjectCopy) => {
                                    self._$scope.$broadcast('E_SUBMIT_SUBJECT_COPY');
                                }, (err) => {
                                    notify.error(err);
                                    self._$scope.$broadcast('E_SUBMIT_SUBJECT_ERROR');
                                });
                            } else {
                                self._$scope.$broadcast('E_SUBMIT_SUBJECT_COPY');
                            }
                        },
                        function (err) {
                            notify.error(err);
                            self._$scope.$broadcast('E_SUBMIT_SUBJECT_ERROR');
                        }
                    );
                }
            });
        });

        self._$scope.$on('E_SUBJECT_COPY_LATER', function(event, subjectCopyId:number, grainCopyId: number) {
            self._subjectCopyService.setCurrentGrain(subjectCopyId, grainCopyId).then(() => {}, err => notify.error(err));
        });

        // init
        self._$scope.$broadcast('E_CURRENT_GRAIN_COPY_CHANGE', undefined);
    };

    get subjectScheduled():ISubjectScheduled {
        return this._subjectScheduled;
    }

    get subjectCopy():ISubjectCopy {
        return this._subjectCopy;
    }

    get grainScheduledList():IGrainScheduled[] {
        if (this._previewing) {
            return this._grainScheduledList;
        }
        return [];
    }

    get grainCopyList():IGrainCopy[] {
        return this._grainCopyList;
    }

    get previewing():boolean {
        return this._previewing;
    }

    get previewingFromLibrary():boolean {
        return this._previewingFromLibrary;
    }

    get previewFromReader():boolean {
        return this._previewFromReader;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
    
    get isCanSubmit():boolean {
        return this._isCanSubmit;
    }

    get currentGrainCopy():IGrainCopy {
        return this._currentGrainCopy;
    }
}

export const performSubjectCopyController = ng.controller('PerformSubjectCopyController', PerformSubjectCopyController);