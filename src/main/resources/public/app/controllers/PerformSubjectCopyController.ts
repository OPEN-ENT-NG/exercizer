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
            subjectId = _$routeParams['subjectId'];
        
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
            // TODO  _$routeParams['subjectCopyId']
            this._perform();
        }
        
    }

    private _preview(subject:ISubject) {
        var self = this;
        this._previewing = true;
        
        this._grainService.getListBySubject(subject).then(
            function(grainList) {
                self._subjectScheduled = self._subjectScheduledService.createFromSubject(subject);
                self._subjectCopy = self._subjectCopyService.createFromSubjectScheduled(self._subjectScheduled);
                self._grainScheduledList = self._grainScheduledService.createGrainScheduledList(grainList);
                self._grainCopyList = self._grainCopyService.createGrainCopyList(self._grainScheduledList);

                self._subjectScheduled.id = Math.floor(Math.random() * (999999999 - 1)) + 1;
                self._subjectCopy.id = Math.floor(Math.random() * (999999999 - 1)) + 1;

                angular.forEach(self._grainCopyList, function(grainCopy:IGrainCopy) {
                    grainCopy.id = Math.floor(Math.random() * (999999999 - 1)) + 1;
                });

                self._eventsHandler(self);
                self._hasDataLoaded = true;
            },
            function(err) {
                notify.error(err);
            }
        );
        
    }
    
    private _perform() {
        // TODO

        this._previewing = false;

        var self = this;
        this._eventsHandler(self);
        this._hasDataLoaded = true;
    }

    private _eventsHandler = function(self) {

        function _updateLocalGrainCopyList(grainCopy:IGrainCopy) {
            for (var i = 0; i < self._grainCopyList.length; ++i) {
                var currentGrainCopy = self._grainCopyList[i];
                if (currentGrainCopy.id === grainCopy.id) {
                    self._grainCopyList[i] = grainCopy;
                    break;
                }
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
            if (!self._subjectCopy.has_been_started) {
                self._subjectCopy.has_been_started = true;
            }
            self._$scope.$broadcast('E_CURRENT_GRAIN_COPY_CHANGE', grainCopy);
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

