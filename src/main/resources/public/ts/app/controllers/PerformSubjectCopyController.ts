import { ng, model, Behaviours, notify } from 'entcore';
import { IGrainCopy, ISubject, IGrain, IGrainScheduled, ISubjectScheduled, ISubjectCopy } from '../models/domain';
import { 
    ISubjectService, ISubjectLibraryService, ISubjectCopyService, 
    IGrainCopyService, IGrainService, IGrainScheduledService, ISubjectScheduledService, IGrainTypeService, IAccessService 
} from '../services';
import { angular } from 'entcore';

class PerformSubjectCopyController {

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
        'AccessService'
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
        private _accessService:IAccessService
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
        this._hasDataLoaded = false;
        this._isCanSubmit = true;

        var self = this,
            subjectId = _$routeParams['subjectId'],
            subjectCopyId = _$routeParams['subjectCopyId'];

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

    private _eventsHandler = function(self) {

        function _updateLocalGrainCopyList(grainCopy:IGrainCopy) {
            var grainCopyIndex = self._grainCopyList.indexOf(grainCopy);

            if (grainCopyIndex !== -1) {
                self._grainCopyList[grainCopyIndex] = grainCopy;
            }
        }

        function _handleUpdateGrainCopy(grainCopy:IGrainCopy) {
            self._grainCopyService.update(grainCopy).then(
                function() {
                    _updateLocalGrainCopyList(grainCopy);
                },
                function(err) {
                    notify.error(err);
                }
            );
        }

        self._$scope.$on('E_UPDATE_GRAIN_COPY', function(event, grainCopy:IGrainCopy) {
            if (!self._previewing) {
                _handleUpdateGrainCopy(grainCopy);
            } else {
                _updateLocalGrainCopyList(grainCopy);
            }
        });

        self._$scope.$on('E_CURRENT_GRAIN_COPY_CHANGED', function(event, grainCopy:IGrainCopy) {
            self._currentGrainCopy = grainCopy;
            self._currentGrainCopyChanged(grainCopy);
        });

        self._$scope.$on('E_SUBJECT_COPY_SUBMITTED', function(event, subjectCopy:ISubjectCopy) {
            let selfSubjectCopy:ISubjectCopy = subjectCopy;
            self._subjectCopyService.checkIsNotCorrectionOnGoingOrCorrected(subjectCopy.id).then(function (isOk) {
                if (isOk !== true) {
                    self._isCanSubmit = false;
                    notify.error("exercizer.check.corrected");
                } else {
                    var subjectCopy:ISubjectCopy = self._subjectCopyService.getById(selfSubjectCopy.id);
                    subjectCopy.submitted_date = new Date().toISOString();
                    self._subjectCopyService.submit(subjectCopy).then(
                        function (subjectCopy:ISubjectCopy) {
                            self._$scope.$broadcast('E_SUBMIT_SUBJECT_COPY');
                        },
                        function (err) {
                            notify.error(err);
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

    /*set currentGrainCopy(grainCopy:IGrainCopy) {
        this._currentGrainCopy = grainCopy;
    }*/
}

export const performSubjectCopyController = ng.controller('PerformSubjectCopyController', PerformSubjectCopyController);