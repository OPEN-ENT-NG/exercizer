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
                        self._view(subjectCopyId);
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
            if (!angular.isUndefined(subjectCopyId)) {
                this._view(subjectCopyId);
            } else {
                this._$location.path('/dashboard');
            }
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

                                self._grainCopyService.getListBySubjectCopy(self._subjectCopy).then(
                                    function(grainCopyList:IGrainCopy[]) {

                                        if (!angular.isUndefined(grainCopyList)) {
                                            self._grainCopyList = grainCopyList;

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

        function _updateLocalGrainCopyList(grainCopy:IGrainCopy) {
            var grainCopyIndex = self._grainCopyList.indexOf(grainCopy);

            if (grainCopyIndex !== -1) {
                self._grainCopyList[grainCopyIndex] = grainCopy;
            }
        }

        function _handleUpdateSubjectCopy(subjectCopy:ISubjectCopy, redirect:boolean) {
            self._subjectCopyService.update(subjectCopy).then(
                function(subjectCopy:ISubjectCopy) {
                    self._subjectCopy = CloneObjectHelper.clone(subjectCopy, true);
                    self._$scope.$broadcast('E_SUBJECT_COPY_UPDATED', redirect);
                },
                function(err) {
                    notify.info(err);
                }
            )
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
            if (!self._subjectCopy.is_corrected && !self._subjectCopy.is_correction_on_going && !self._previewing  && self._isTeacher) {
                self._subjectCopy.is_correction_on_going = true;
                self._subjectCopyService.update(self._subjectCopy).then(
                    function(subjectCopy:ISubjectCopy) {
                        self._subjectCopy = CloneObjectHelper.clone(subjectCopy, true);
                        self._$scope.$broadcast('E_CURRENT_GRAIN_COPY_CHANGE', grainCopy);
                    },
                    function(err) {
                        notify.error(err);
                    }
                );
            } else {
                self._$scope.$broadcast('E_CURRENT_GRAIN_COPY_CHANGE', grainCopy);
            }
        });

        self._$scope.$on('E_UPDATE_SUBJECT_COPY', function(event, subjectCopy:ISubjectCopy, redirect:boolean) {
            if (!self._previewing  && self._isTeacher) {
                _handleUpdateSubjectCopy(subjectCopy, redirect);
            }
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

