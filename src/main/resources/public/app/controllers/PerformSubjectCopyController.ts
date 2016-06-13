class PerformSubjectCopyController {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainService',
        'GrainScheduledService',
        'GrainCopyService',
        'GrainTypeService',
    ];

    private _subjectScheduled:ISubjectScheduled;
    private _subjectCopy:ISubjectCopy;
    private _grainCopyList:IGrainCopy[];
    private _grainScheduledList:IGrainScheduled[];
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
        private _grainService:IGrainService,
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
                    self._preview(subject);
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
                                            self._grainCopyList = grainCopyList;
                                            self._eventsHandler(self);
                                            self._hasDataLoaded = true;
                                            
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
            if (!self._subjectCopy.has_been_started && !self._previewing) {
                self._subjectCopy.has_been_started = true;
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

        self._$scope.$on('E_SUBJECT_COPY_SUBMITTED', function(event, subjectCopy:ISubjectCopy) {
            subjectCopy.submitted_date = new Date().getTime().toString(); // FIXME might not work
            self._subjectCopyService.update(subjectCopy).then(
                function(subjectCopy:ISubjectCopy) {
                    self._subjectCopy = CloneObjectHelper.clone(subjectCopy, true);
                    self._$scope.$broadcast('E_SUBMIT_SUBJECT_COPY');
                },
                function(err) {
                    notify.error(err);
                }
            );
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

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
}

