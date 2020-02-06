import { ng, notify, idiom } from 'entcore';
import { IGrainCopy, IGrainScheduled, ISubjectScheduled, ISubjectCopy } from '../models/domain';
import { 
    ISubjectService, ISubjectLibraryService, ISubjectCopyService, ISubjectScheduledService, 
    IGrainCopyService, IGrainScheduledService, IGrainTypeService, IAccessService, IDateService, SubjectCopyService
} from '../services';
import { CloneObjectHelper, CorrectOrderHelper } from '../models/helpers';

class SubjectCopyFinalScoreController {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectLibraryService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainScheduledService',
        'GrainCopyService',
        'GrainTypeService',
        'AccessService',
        'DateService'
    ];

    private _subjectScheduled:ISubjectScheduled;
    private _subjectCopy:ISubjectCopy;
    private _grainScheduledList:IGrainScheduled[];
    private _grainCopyList:IGrainCopy[];
    private _isTeacher:boolean;
    private _previewing:boolean;
    private _previewingFromLibrary:boolean;
    private _hasDataLoaded:boolean;

    constructor
    (
        private _$routeParams,
        private _$scope,
        private _$location,
        private _subjectService:ISubjectService,
        private _subjectLibraryService:ISubjectLibraryService,
        private _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _grainScheduledService:IGrainScheduledService,
        private _grainCopyService:IGrainCopyService,
        private _grainTypeService:IGrainTypeService,
        private _accessService:IAccessService,
        private _dateService:IDateService
    ) {
        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectLibraryService = _subjectLibraryService;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService =_subjectCopyService;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;
        this._grainTypeService = _grainTypeService;
        this._hasDataLoaded = false;
        this._isTeacher = false;

        var self = this,
            subjectCopyId = _$routeParams['subjectCopyId'];
        if (!angular.isUndefined(subjectCopyId)) {
            this._view(subjectCopyId);
        } else {
            this._$location.path('/dashboard');
        }
    }

    private _view(subjectCopyId:number) {
        var self = this;
        this._previewing = false;

        this._subjectScheduledService.resolve(self._isTeacher).then(
            function() {
                self._subjectCopyService.resolve(self._isTeacher).then(
                    function() {
                        self._subjectCopy = self._subjectCopyService.getById(subjectCopyId);

                        if (!angular.isUndefined(self._subjectCopy)) {

                            self._subjectScheduled = self._subjectScheduledService.getById(self._subjectCopy.subject_scheduled_id);

                            if (!angular.isUndefined(self._subjectScheduled)) {

                                if(self._isTeacher || self._dateService.compare_after(new Date(), self._dateService.isoToDate(self._subjectScheduled.due_date), false)){

                                    self._grainCopyService.getListBySubjectCopy(self._subjectCopy).then(
                                        function(grainCopyList:IGrainCopy[]) {

                                            if (!angular.isUndefined(grainCopyList)) {
                                                self._grainCopyList = grainCopyList;
                                                self._$scope.$emit('E_GRAIN_COPY_LIST', self._grainCopyList);

                                                self._grainScheduledService.getListBySubjectScheduled(self._subjectScheduled).then(
                                                    function(grainScheduledList:IGrainScheduled[]) {

                                                        if (!angular.isUndefined(grainScheduledList)) {
                                                            self._grainScheduledList = grainScheduledList;
                                                            self._eventsHandler(self);
                                                            self._hasDataLoaded = true;
                                                        } else {
                                                            self._$location.path('/dashboard');
                                                        }

                                                    },
                                                    function(err) {
                                                        notify.error(err);
                                                    }
                                                );
                                            } else {
                                                self._$location.path('/dashboard');
                                            }

                                        },
                                        function(err) {
                                            notify.error(err);
                                        }
                                    )

                                } else{
                                    notify.info(idiom.translate("exercizer.service.check.copyview") + " " + self._dateService.isoToDate(self._subjectScheduled.due_date).toLocaleDateString());
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

    private _eventsHandler = function(self) {

        function _calculateScores() {
            var calculatedScore:number = 0,
                finalScore:number = 0;

            angular.forEach(self._grainCopyList, function(grainCopy:IGrainCopy) {
                
                if(!angular.isUndefined(grainCopy.calculated_score) && grainCopy.calculated_score !== null) {
                    calculatedScore += parseFloat(grainCopy.calculated_score.toString());

                    if (angular.isUndefined(grainCopy.final_score) || grainCopy.final_score === null) {
                        finalScore += parseFloat(grainCopy.calculated_score.toString());
                        grainCopy.final_score = grainCopy.calculated_score;
                    } else {
                        finalScore += parseFloat(grainCopy.final_score.toString());
                    }
                }
            });

            self._subjectCopy.calculated_score = calculatedScore;
            self._subjectCopy.final_score = finalScore;
        }

        function _updateLocalGrainCopyList(grainCopy:IGrainCopy) {
            var grainCopyIndex = self._grainCopyList.indexOf(grainCopy);

            if (grainCopyIndex !== -1) {
                self._grainCopyList[grainCopyIndex] = grainCopy;
            }
        }

        function _handleUpdateSubjectCopy(subjectCopy:ISubjectCopy, redirect:boolean) {
            _calculateScores();
            let success = function(subjectCopy:ISubjectCopy) {
                self._subjectCopy = CloneObjectHelper.clone(subjectCopy, true);
                self._$scope.$broadcast('E_SUBJECT_COPY_UPDATED', redirect);
            };
            let error = function(err) {
                notify.error(err);
            }
            if (subjectCopy.is_corrected) {
                self._subjectCopyService.correct(subjectCopy).then(success, error);
            } else {
                self._subjectCopyService.update(subjectCopy).then(success, error);
            }
        }

        function _handleUpdateGrainCopy(grainCopy:IGrainCopy) {
            self._grainCopyService.correct(grainCopy).then(
                function() {
                    _updateLocalGrainCopyList(grainCopy);
                    _calculateScores();
                },
                function(err) {
                    notify.error(err);
                }
            );
        }

        /**
         * this event is call when a grain copy is updated
         * - from grainCopyFooter.ts
         */
        self._$scope.$on('E_UPDATE_GRAIN_COPY', function(event, grainCopy:IGrainCopy) {
            if (!self._previewing && self._isTeacher) {
                _handleUpdateGrainCopy(grainCopy);
                self._$scope.$broadcast('E_CURRENT_GRAIN_COPY_CHANGED', grainCopy);
            } else {
                _updateLocalGrainCopyList(grainCopy);
                _calculateScores();
            }
        });

        self._$scope.$on('E_CURRENT_GRAIN_COPY_CHANGED', function(event, grainCopy:IGrainCopy) {
                _calculateScores();
        });

        /**
         * this event is call when a subject copy is updated
         * - viewSummery.ts
         */
        self._$scope.$on('E_UPDATE_SUBJECT_COPY', function(event, subjectCopy:ISubjectCopy, redirect:boolean) {
            if (!self._previewing  && self._isTeacher) {
                _handleUpdateSubjectCopy(subjectCopy, redirect);
            } else if (self._previewing && self._isTeacher) {
               _calculateScores();
                self._$scope.$broadcast('E_SUBJECT_COPY_UPDATED', redirect);
            }
        });

        // init
        self._$scope.$broadcast('E_CURRENT_GRAIN_COPY_CHANGE', undefined);
    };

    public getGrainCopyName = function (grainCopy:IGrainCopy) {
        if (grainCopy.grain_copy_data && grainCopy.grain_copy_data.title) {
            return grainCopy.grain_copy_data.title;
        } else {
            var grainType = this._grainTypeService.getById(grainCopy.grain_type_id);
            return grainType.public_name;
        }
    };

    public getCorrectOrder = function(grainCopy:IGrainCopy) {
        return CorrectOrderHelper.getCorrectOrder(grainCopy, this._subjectCopy);
    };

    get subjectScheduled():ISubjectScheduled {
        return this._subjectScheduled;
    }

    get subjectCopy():ISubjectCopy {
        return this._subjectCopy;
    }

    get grainScheduledList():IGrainScheduled[] {
        return this._grainScheduledList;
    }

    get grainCopyList():IGrainCopy[] {
        return this._grainCopyList;
    }

    get isTeacher():boolean {
        return this._isTeacher;
    }

    get previewing():boolean {
        return this._previewing;
    }

    get previewingFromLibrary():boolean {
        return this._previewingFromLibrary;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
}

export const subjectCopyFinalScoreController = ng.controller('SubjectCopyFinalScoreController', SubjectCopyFinalScoreController);