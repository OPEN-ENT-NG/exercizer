import { ng, idiom, notify, IObjectGuardDelegate, navigationGuardService, ObjectGuard, EditTrackingEvent, trackingService } from 'entcore';
import { ISubject, IGrain, IGrainDocument, GrainData, GrainDocument, Grain, IGrainType } from '../models/domain';
import { ISubjectService, ISubjectScheduledService, ISubjectCopyService, IGrainTypeService, IGrainService, IDragService } from '../services';
import { StringISOHelper, CorrectOrderHelper } from '../models/helpers';
import { angular } from 'entcore';
import { $ } from 'entcore';
import { _ } from 'entcore';
import * as rx from 'rxjs';

type IGrainTask = {
    operation: "add" | "update",
    grain: IGrain,
    done: "waiting" | "success" | "failed"
}

// Utility function for computing scores
function sanitizeScore( value:any ): number {
    value = angular.isUndefined(value) ? 0 : parseFloat(parseFloat(String(value).replace(',', '.')).toFixed(2));
    return isNaN(value) ? 0 : value;
}

export class EditSubjectController implements IObjectGuardDelegate {

    static $inject = [
        '$routeParams',
        '$sce',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainService',
        'GrainTypeService',
        'DragService'
    ];

    // common
    private _subject:ISubject;
    private _grainList:IGrain[];
    private _selectedGrainList:IGrain[];
    private _hasDataLoaded:boolean;

    // statement trusted html
    private _trustedHtmlStatementMap:{[grainId:number]:string};

    // modal
    private _isDropableZone:boolean;
    private _isModalRemoveGrainDocumentDisplayed:boolean;
    private _isModalRemoveSelectedGrainListDisplayed:boolean;
    private _currentGrainForAction:IGrain;
    private _currentGrainDocumentToRemove:IGrainDocument;

    // organizer
    private _isOrganizerFolded:boolean;
    private _reOrderTimeout:any;
    private _lockTasks = false;
    private _pendingTasks:IGrainTask[] = [];
    private _pendingEdit:IGrain[] = [];
    private _updateGrainError = new rx.Subject<string>();
    private _grainStreams = new Map<number, rx.Subject<IGrain>>();
    private _subscriptions = new Array<rx.Subscription>();
    public shouldShowNavigationAlert:boolean;
    public saving = false;
    private state: "loading" | "loaded" = "loading"
    private _getDebouncedGrain : (grain:IGrain) => rx.Subject<IGrain>;
    constructor
    (
        private _$routeParams,
        protected _$sce,
        private _$scope,
        private _$location,
        private _subjectService:ISubjectService,
        protected _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _grainService:IGrainService,
        private _grainTypeService:IGrainTypeService,
        private _dragService:IDragService
    ) {

        this._$scope = _$scope;
        this._$sce = _$sce;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService = _subjectCopyService;
        this._grainService = _grainService;
        this._grainTypeService = _grainTypeService;
        this._dragService = _dragService;

        this._hasDataLoaded = false;

        // statement trusted html
        this._trustedHtmlStatementMap = {};

        // modal
        this._isModalRemoveSelectedGrainListDisplayed = false;
        this._isDropableZone = false;
        this._isModalRemoveGrainDocumentDisplayed = false;
        this._currentGrainForAction = undefined;
        this._currentGrainDocumentToRemove = undefined;

        // organizer
        this._isOrganizerFolded = false;
        this._reOrderTimeout = null;
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
        _$scope.$root.$on('E_SUBJECTEDIT_DROPABLE_ACTIVATED', function(event, displayDropZone:boolean) {
            self._isDropableZone = displayDropZone;
        });
        this._subscriptions.push(this._updateGrainError.debounceTime(500).subscribe((err)=>{
            notify.error(err);
        }));
        var self = this,
            subjectId = _$routeParams['subjectId'];
        const getDebouncedGrainStream = (grain:IGrain) => {
            if(!this._grainStreams.has(grain.id)){
                const observable = new rx.Subject<IGrain>();
                this._grainStreams.set(grain.id, observable);
                this._subscriptions.push(observable.debounceTime(2000).subscribe((grain)=>{
                    this.updateGrain(grain);
                }));
            }
            return this._grainStreams.get(grain.id);
        }
        this._getDebouncedGrain = getDebouncedGrainStream;
        this._subjectService.resolve().then(function() {
            self._subject = self._subjectService.getById(subjectId);

            if (angular.isUndefined(self._subject)) {
                self.redirectToDashboard();
            } else {
                self._grainService.getListBySubject(self._subject).then(
                    function (grainList) {
                        self.state = "loaded";
                        self._grainList = grainList;
                        self._selectedGrainList = [];

                        self._$scope.$on('E_UPDATE_GRAIN', function(event, grain:IGrain) {
                            //use debounce to reduce queries
                            //self.updateGrain(grain);
                            getDebouncedGrainStream(grain).next(grain);
                        });

                        self._hasDataLoaded = true;
                    },
                    function (err) {
                        notify.error(err);
                    }
                );
            }
        }, function(err) {
            notify.error(err);
        });
    }

    isEmptyStateVisible(){
        return this.state == "loaded" && this.grainList.length == 0;
    }

    isLoaderVisible(){
        return this.state == "loading";
    }

    getTracker():EditTrackingEvent{
        return this.subject.getTracker();
    }

    guardObjectIsDirty(): boolean {
        this._pendingEdit = this.grainList.filter((e)=>e.getTracker().status=='editing');
        return this._pendingTasks.length > 0 || this._pendingEdit.length > 0;
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
                    this.updateGrain(grain, (ok)=>{
                        done++;
                        if(done == count && this._pendingTasks.length == 0){
                            notify.success("exercizer.navigation.success");
                            this.closeNavigationAlert();
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
            if(task.operation == "add"){
                this.addGrain((ok)=>{
                    task.done = ok?"success":"failed";
                    tryFinish();
                });
            }else if(task.operation == "update") {
                this.updateGrain(task.grain, (event)=>{
                    task.done = event.ok?"success":"failed";
                    tryFinish();
                })
            } else {
                task.done = "success";
                tryFinish();
            }
        }
        tryFinish();
    }

    /*
     * COMMON
     */

    public redirectToDashboard() {
        this._$location.path('/dashboard');
    };

    public translate = function(key) {
        return idiom.translate(key);
    };

    public scheduleSubject() {
        this._$scope.$broadcast('E_DISPLAY_MODAL_SCHEDULE_SUBJECT', this._subject);
    }

    public getGrainDisplayedName = function (grain) {
        let toIsoTitle = '';
        if (grain.grain_data.title !== undefined) {
            toIsoTitle = grain.grain_data.title;
        }
        else {
            toIsoTitle = this.getGrainPublicName(grain.grain_type_id)
        }
        return toIsoTitle;
    };

    public getGrainIllustrationURL = function(grainTypeId) {
        return this._grainTypeService.getIllustrationURL(grainTypeId);
    };

    public getGrainPublicName = function(grainTypeId) {
        return this._grainTypeService.getPublicName(grainTypeId);
    };

    public getStatementTrustedHtml = function(grain:IGrain) {
        if (angular.isUndefined(this._trustedHtmlStatementMap[grain.id]) && grain.grain_data.custom_data) {
            this._trustedHtmlStatementMap[grain.id] = this._$sce.trustAsHtml(grain.grain_data.custom_data.statement);
        }
        return this._trustedHtmlStatementMap[grain.id];
    };

    public dropTo = function($item) {
        var self:EditSubjectController = this;

        this._grainService.duplicate($item, this._subject).then(
            function(grainDuplicated) {
                self._$scope.$$postDigest(function() {
                    $('html, body').animate({ scrollTop: $('#grain-edit-' + grainDuplicated.id).offset().top - 100}, 500);
                });

            },
            function(err) {
                notify.error(err);
            }
        )

        self._isDropableZone = false;
    };

    /*public dropTo = function($originalEvent) {
        var dataField = this._dragService.dropConditionFunction(this._subject, $originalEvent),
            originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField)),
            self = this;

        this._grainService.duplicate(originalItem, this._subject).then(
            function(grainDuplicated) {
                self._$scope.$$postDigest(function() {
                    $('html, body').animate({ scrollTop: $('#grain-edit-' + grainDuplicated.id).offset().top - 100}, 500);
                });

            },
            function(err) {
                notify.error(err);
            }
        )
    };*/

    public isChooseStep = function(grain:IGrain){
        return grain.grain_type_id == 2;
    }
    /**
     *  GRAIN
     */

    public addGrainWithType = function(grainType?:number) {
        const self:EditSubjectController = this;
        self.addGrain(()=>{}, grainType);
    }

    public addGrain = function(onSave?:(ok:boolean)=>void, grainType?:number) {
        const self:EditSubjectController = this,
            newGrain = new Grain();
        //new grain
        newGrain.subject_id = this.subject.id;
        newGrain.grain_data = new GrainData();
        newGrain.grain_type_id = grainType || 1;
        newGrain.grain_data.title = '';
        newGrain.grain_data.max_score = 0;
        //track task
        const task : IGrainTask = {done: "waiting", grain: newGrain, operation: "add"}; 
        if(!self._lockTasks){
            self._pendingTasks.push(task);
        }
        newGrain.getTracker().onStop();
        this._grainService.persist(newGrain).then(
            function () {
                self._pendingTasks = self._pendingTasks.filter(t=> t!== task);
                onSave && onSave(true);
                newGrain.getTracker().onFinish(true);
            },
            function (err) {
                notify.error(err);
                onSave && onSave(false);
                newGrain.getTracker().onFinish(false);
            }
        );
    };
    public updateGrainDebounced = function(grain:IGrain) {
        this._getDebouncedGrain(grain).next(grain);
    }

    public updateGrain = function(grain:IGrain, onSave?:({ok:boolean, grain: IGrain})=>void) {
        var self:EditSubjectController = this;
        const task : IGrainTask = {done: "waiting", grain: grain, operation: "update"}; 
        if(!self._lockTasks){
            self._pendingTasks.push(task);
        }

        if (grain.grain_type_id > 3) {

            grain.grain_data.title = StringISOHelper.toISO(grain.grain_data.title);
            grain.grain_data.statement = StringISOHelper.toISO(grain.grain_data.statement);
            grain.grain_data.answer_explanation = StringISOHelper.toISO(grain.grain_data.answer_explanation);
            grain.grain_data.answer_hint = StringISOHelper.toISO(grain.grain_data.answer_hint);
            grain.grain_data.max_score = sanitizeScore(grain.grain_data.max_score);

        } else if (grain.grain_type_id === 3) {

            self._trustedHtmlStatementMap[grain.id] = undefined;

            /*if (angular.isUndefined(this._trustedHtmlStatementMap[grain.id]) && grain.grain_data.custom_data) {
             this._trustedHtmlStatementMap[grain.id] = this._$sce.trustAsHtml(grain.grain_data.custom_data.statement);
             } else{

             }*/
            //this._trustedHtmlStatementMap[grain.id] = this._$sce.trustAsHtml(grain.grain_data.custom_data.statement);
        }
        self.saving = true;
        grain.getTracker().onStop();
        self._grainService.update(grain).then(
            function() {
                self._pendingTasks = self._pendingTasks.filter(t=> t!== task);
                self.saving = false;
                onSave && onSave({ok:true, grain: grain});
                grain.getTracker().onFinish(true);
            },
            function(err) {
                self._updateGrainError.next(err);
                self.saving = false;
                onSave && onSave({ok:false, grain: grain});
                grain.getTracker().onFinish(false);
            }
        );
    };

/* @deprecated WB-446
    public addGrainDocument = function(mediaLibraryItem:any) {
        var grainDocument = new GrainDocument(),
            self = this;

        grainDocument.id = mediaLibraryItem._id;
        grainDocument.owner = mediaLibraryItem.owner;
        grainDocument.ownerName = mediaLibraryItem.ownerName;
        grainDocument.created = mediaLibraryItem.created ? mediaLibraryItem.created.toISOString() : null;
        grainDocument.title = mediaLibraryItem.title;
        grainDocument.name = mediaLibraryItem.name;
        grainDocument.path = '/workspace/document/' + grainDocument.id;

        if (angular.isUndefined(this._currentGrainForAction.grain_data.document_list)) {
            this._currentGrainForAction.grain_data.document_list = [];
        }

        this._currentGrainForAction.grain_data.document_list.push(grainDocument);

        this._grainService.update(this._currentGrainForAction).then(
            function() {
                self._currentGrainForAction = undefined;
            },
            function(err) {
                notify.error(err);
            }
        );
    };
*/

    public removeGrainDocument = function() {
        var grainDocumentIndex = this._currentGrainForAction.grain_data.document_list.indexOf(this._currentGrainDocumentToRemove),
            self = this;

        if (grainDocumentIndex !== -1) {
            this._currentGrainForAction.grain_data.document_list.splice(grainDocumentIndex, 1);
            this._grainService.update(this._currentGrainForAction).then(
                function() {
                    self._currentGrainForAction = undefined;
                    self._currentGrainDocumentToRemove = undefined;
                    self._isModalRemoveGrainDocumentDisplayed = false;
                },
                function(err) {
                    notify.error(err);
                }
            );
        }
    };

    public displayModalRemoveGrainDocument = function(grain:IGrain, grainDocument:IGrainDocument) {
        this._currentGrainForAction = grain;
        this._currentGrainDocumentToRemove = grainDocument;
        this._isModalRemoveGrainDocumentDisplayed = true;
    };

    public closeModalRemoveGrainDocument = function() {
        this._currentGrainForAction = undefined;
        this._currentGrainDocumentToRemove = undefined;
        this._isModalRemoveGrainDocumentDisplayed = false;
    };

    public getCorrectOrder(grain:IGrain) {
        return CorrectOrderHelper.getCorrectOrder(grain, this._grainList);
    };

    public getScoringCSS(grain:IGrain) {
        return {
            'color': grain.grain_data.max_score > 0 ? 'inherit' : '#FF8D2E',
            'border-bottom': `2px solid ${grain.grain_data.max_score > 0 ? '#6FBE2E' : '#FF8D2E'}`,
            'box-shadow': 'none'
        }
    }

    /*
     * ORGANIZER
     */
    public previewPerformSubjectCopy = function() {
        this._$location.path('/subject/copy/preview/perform/' + this._subject.id + '/');
    };

    public reOrder = function()
    {
        angular.forEach(this._grainList, function (grainItem) {
            if (grainItem.order_by != parseFloat(grainItem.index) + 1) {
                grainItem.order_by = parseFloat(grainItem.index) + 1;
            }
        });

        if (this._reOrderTimeout == null)
        {
            var self:EditSubjectController = this;
            this._reOrderTimeout = window.setTimeout(function()
            {
                angular.forEach(self._grainList, function (grain:IGrain) {
                    self.updateGrain(grain);
                });
                self._reOrderTimeout = null;
            }, 0);
        }
    };

    public foldOrganizer = function() {
        this._isOrganizerFolded = !this._isOrganizerFolded;
    };

    public scrollToGrain = (grain_id) => {
        $('html, body').animate({ scrollTop: $(`#grain-edit-${grain_id}`).offset().top - 70 }, 500);
    }

    public checkboxClick = function(grain:IGrain) {
        grain.selected = !grain.selected;
    }

    /*
     *  TOASTER
     */
    public selectGrain = function(grain:IGrain) {
        var grainIndex = this._selectedGrainList.indexOf(grain);

        if (grainIndex !== -1) {
            this._selectedGrainList.splice(grainIndex, 1);
        } else {
            this._selectedGrainList.push(grain);
        }

        if (this._selectedGrainList.length > 1) {
            this._selectedGrainList.sort(function(grainA:IGrain, grainB:IGrain) {
                return grainA.order_by > grainB.order_by;
            });
        }
    };

    public duplicate = function(grain:IGrain) {
        var self:EditSubjectController = this;
        this.selectGrain( grain );

        this._grainService.duplicateIntoSubject(this._selectedGrainList, this._subject.id).then(
            function() {
                self._selectedGrainList = [];
                self._grainService.getListBySubject(self._subject).then(
                    function(grainList) {
                        self._grainList = grainList;
                        var grainIdToScroll=0;
                        _.forEach(grainList, function (grain) {
                           if (grain.id > grainIdToScroll) grainIdToScroll = grain.id;
                        });

                        self._$scope.$$postDigest(function() {
                            self.scrollToGrain(grainIdToScroll);
                        });
                    }
                );
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public removeGrain = async function(grain:IGrain) {
        const self:EditSubjectController = this;
        try{
            await self._grainService.removeList([grain], self._subject);
        }catch(e){
            notify.error(e);
        }
    };

    public removeSelectedGrainList = function() {
        var self:EditSubjectController = this;

        this._grainService.removeList(this._selectedGrainList, this._subject).then(
            function() {
                self.closeModalRemoveSelectedGrainList();
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public displayModalRemove = function( grain:IGrain ) {
        this.selectGrain( grain );
        this._isModalRemoveSelectedGrainListDisplayed = true;
    };

    public closeModalRemoveSelectedGrainList = function() {
        this._selectedGrainList = [];
        this._isModalRemoveSelectedGrainListDisplayed = false;
    };

    /*
     *  GETTER
     */

    get subject():ISubject {
        return this._subject;
    }

    get grainList():IGrain[] {
        return this._grainList;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }

    get isModalRemoveGrainDocumentDisplayed():boolean {
        return this._isModalRemoveGrainDocumentDisplayed;
    }

    get organizerFolded():boolean {
        return this._isOrganizerFolded;
    }

    set organizerFolded(value : boolean) {
        this._isOrganizerFolded = value;
    }

    get isModalRemoveSelectedGrainListDisplayed():boolean {
        return this._isModalRemoveSelectedGrainListDisplayed;
    }

    get isDropableZone():boolean {
        return this._isDropableZone;
    }

    public get computedMaxScore() {
        let total:number = 0;
        angular.forEach(this._grainList, function(grain:IGrain) {
            if (grain.grain_type_id > 3) {
                total += sanitizeScore(grain.grain_data.max_score);
            }
        }, this);
        return total;
    }
}

export const editSubjectController = ng.controller('EditSubjectController', EditSubjectController);