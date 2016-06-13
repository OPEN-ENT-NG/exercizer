class ViewSubjectCopyController {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainScheduledService',
        'GrainCopyService',
        'GrainTypeService',
    ];

    private _subjectScheduled:ISubjectScheduled;
    private _subjectCopy:ISubjectCopy;
    private _grainScheduledList:IGrainScheduled[];
    private _grainCopyList:IGrainCopy[];
    private _isTeacher:boolean;
    private _previewing:boolean;
    private _hasDataLoaded:boolean;

    constructor
    (
        private _$routeParams,
        private _$scope:ng.IScope,
        private _$location:ng.ILocationService,
        private _subjectService:ISubjectService,
        private _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _grainScheduledService:IGrainScheduledService,
        private _grainCopyService:IGrainCopyService,
        private _grainTypeService:IGrainTypeService
    ) {
        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService =_subjectCopyService;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;
        this._grainTypeService = _grainTypeService;
        this._hasDataLoaded = false;

        var self = this,
            subjectId = _$routeParams['subjectId'],
            subjectCopyId = _$routeParams['subjectCopyId'];

        if (!angular.isUndefined(subjectId)) {
            this._subjectService.resolve().then(function() {
                var subject = self._subjectService.getById(subjectId);
                if (!angular.isUndefined(subject)) {
                    self._isTeacher = true;
                    if (!angular.isUndefined(subjectCopyId)) {
                        self._view();
                    } else {
                        self._preview(subject.id);
                    }
                } else {
                    self._$location.path('/dashboard');
                }

            }, function(err) {
                notify.error(err);
            });

        } else {
            // TODO  _$routeParams['subjectCopyId']
            this._view();
        }

    }

    private _preview(subjectId:number) {
        this._previewing = true;

        var subjectCopyService = this._subjectCopyService as SubjectCopyService,
            tmpPreviewData = subjectCopyService.tmpPreviewData;
        
        if (angular.isUndefined(tmpPreviewData)) {
            this._$location.path('/subject/edit/' + subjectId + '/');
        } else {
            this._subjectScheduled = CloneObjectHelper.clone(tmpPreviewData.subjectScheduled, true);
            this._subjectCopy = CloneObjectHelper.clone(tmpPreviewData.subjectCopy, true);
            this._grainScheduledList = CloneObjectHelper.clone(tmpPreviewData.grainScheduledList, true);
            this._grainCopyList = CloneObjectHelper.clone(tmpPreviewData.grainCopyList, true);

            subjectCopyService.tmpPreviewData = undefined;

            var self = this;
            this._eventsHandler(self);
            this._hasDataLoaded = true;
        }
    }

    private _view() {
        // TODO

        this._previewing = false;

        var self = this;
        this._eventsHandler(self);
        this._hasDataLoaded = true;
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
            if (!self._previewing && self._isTeacher) {
                // TODO update subject copy final score
                _handleUpdateGrainCopy(grainCopy);
            } else {
                _updateLocalGrainCopyList(grainCopy);
            }
        });

        self._$scope.$on('E_CURRENT_GRAIN_COPY_CHANGED', function(event, grainCopy:IGrainCopy) {
            self._$scope.$broadcast('E_CURRENT_GRAIN_COPY_CHANGE', grainCopy);
        });
        
        // TODO E_UPDATE_SUBJECT_COPY

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

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
}

