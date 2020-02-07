import { ng, notify } from 'entcore';
import { IGrainCopy, IGrainScheduled, ISubjectScheduled, ISubjectCopy } from '../models/domain';
import { ISubjectCopyService, ISubjectScheduledService, IGrainCopyService, IGrainScheduledService} from '../services';
import { CloneObjectHelper, CorrectOrderHelper } from '../models/helpers';

class SubjectCopyFinalScoreController {

    static $inject = [
        '$routeParams',
        '$location',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainScheduledService',
        'GrainCopyService',
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
        private _$location,
        private _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _grainScheduledService:IGrainScheduledService,
        private _grainCopyService:IGrainCopyService,
    ) {
        this._$location = _$location;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService =_subjectCopyService;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;
        this._hasDataLoaded = false;
        this._isTeacher = false;

        var subjectCopyId = _$routeParams['subjectCopyId'];
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

                        if (!angular.isUndefined(self._subjectCopy) || !self._subjectCopy.is_training_copy || !self._subjectCopy.submitted_date) {

                            self._subjectScheduled = self._subjectScheduledService.getById(self._subjectCopy.subject_scheduled_id);

                            if (!angular.isUndefined(self._subjectScheduled)) {
                                self._grainCopyService.getListBySubjectCopy(self._subjectCopy).then(
                                    function(grainCopyList:IGrainCopy[]) {

                                        if (!angular.isUndefined(grainCopyList)) {
                                            self._grainCopyList = grainCopyList;

                                            self._grainScheduledService.getListBySubjectScheduled(self._subjectScheduled).then(
                                                function(grainScheduledList:IGrainScheduled[]) {

                                                    if (!angular.isUndefined(grainScheduledList)) {
                                                        self._grainScheduledList = grainScheduledList;
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
                                );
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

    public getGrainCopyName = function (grainCopy:IGrainCopy) {
        if (grainCopy.grain_copy_data && grainCopy.grain_copy_data.title) {
            return grainCopy.grain_copy_data.title;
        } else {
            var grainType = this._grainTypeService.getById(grainCopy.grain_type_id);
            return grainType.public_name;
        }
    };

    public getCorrectOrder = function(grainCopy:IGrainCopy) {
        return CorrectOrderHelper.getCorrectOrder(grainCopy, this._grainCopyList);
    };

    public viewSubjectCopy() {
        this._$location.path(`/subject/copy/view/${this._subjectCopy.id}`);
    }

    public retrySubjectCopy() {
        this._subjectCopy.has_been_started = true;
        this._subjectCopyService.retry(this._subjectCopy, this._grainCopyList).then(success => {
            this._$location.path(`/subject/copy/perform/${this._subjectCopy.id}`);
        }, err => {
            notify.error(err);
        });
    }

    get subjectScheduled():ISubjectScheduled {
        return this._subjectScheduled;
    }

    get subjectCopy():ISubjectCopy {
        return this._subjectCopy;
    }

    get grainCopyList():IGrainCopy[] {
        return this._grainCopyList;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
}

export const subjectCopyFinalScoreController = ng.controller('SubjectCopyFinalScoreController', SubjectCopyFinalScoreController);