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
    private _hasDataBeenLoaded:boolean;

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
        this._hasDataBeenLoaded = false;

        var subjectId = _$routeParams['subjectId'];
        
        if (!angular.isUndefined(subjectId)) {
            var subject = this._subjectService.getById(subjectId);
            
            if (!angular.isUndefined(subject)) {
                this._preview(subject);
            } else {
                this._$location.path('/dashboard');
            }
        } else {
            this._perform();
        }
        
    }

    private _preview(subject:ISubject) {
        
        this._grainService.getListBySubject(subject).then(
            function(grainList) {
                this._subjectScheduled = this._subjectScheduledService.createFromSubject(subject);
                this._subjectCopy = this._subjectCopyService.createFromSubjectScheduled(this._subjectScheduled);
                this._grainScheduledList = this._grainScheduledService.createGrainScheduledList(grainList);
                this._grainCopyList = this._grainCopyService.createGrainCopyList(this._grainScheduledList);
                this._previewing = true;

                this._subjectScheduled.id = Math.floor(Math.random() * (999999999 - 1)) + 1;
                this._subjectCopy.id = Math.floor(Math.random() * (999999999 - 1)) + 1;

                angular.forEach(this._grainCopyList, function(grainCopy:IGrainCopy) {
                    grainCopy.id = Math.floor(Math.random() * (999999999 - 1)) + 1;
                });

                var self = this;
                this._eventsHandler(self);
                this._hasDataBeenLoaded = true;
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
        this._hasDataBeenLoaded = true;
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

    set subjectScheduled(value:ISubjectScheduled) {
        this._subjectScheduled = value;
    }

    get subjectCopy():ISubjectCopy {
        return this._subjectCopy;
    }

    set subjectCopy(value:ISubjectCopy) {
        this._subjectCopy = value;
    }

    get grainCopyList():IGrainCopy[] {
        return this._grainCopyList;
    }

    set grainCopyList(value:IGrainCopy[]) {
        this._grainCopyList = value;
    }

    get hasDataBeenLoaded():boolean {
        return this._hasDataBeenLoaded;
    }

    set hasDataBeenLoaded(value:boolean) {
        this._hasDataBeenLoaded = value;
    }
}

