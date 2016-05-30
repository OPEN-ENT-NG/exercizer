class PerformSubjectCopyController {

    static $inject = [
        '$scope',
        '$location',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainService',
        'GrainScheduledService',
        'GrainCopyService',
        'GrainTypeService',
        // received events
        'E_UPDATE_GRAIN_COPY',
        'E_CURRENT_GRAIN_COPY_CHANGED'
        // broadcast events
    ];

    private _subjectScheduled:ISubjectScheduled;
    private _subjectCopy:ISubjectCopy;
    private _grainCopyList:IGrainCopy[];
    private _grainScheduledList:IGrainScheduled[];
    private _previewing:boolean;
    private _hasDataBeenLoaded:boolean;

    constructor
    (
        private _$scope:ng.IScope,
        private _$location:ng.ILocationService,
        private _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _grainService:IGrainService,
        private _grainScheduledService:IGrainScheduledService,
        private _grainCopyService:IGrainCopyService,
        private _grainTypeService:IGrainTypeService,
        // received events
        private _E_UPDATE_GRAIN_COPY,
        private _E_CURRENT_GRAIN_COPY_CHANGED,
        // broadcast events
        private _E_CURRENT_GRAIN_COPY_CHANGE
    )
    {
        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService =_subjectCopyService;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;
        this._grainTypeService = _grainTypeService;
        this._hasDataBeenLoaded = false;

        // received events
        this._E_UPDATE_GRAIN_COPY = _E_UPDATE_GRAIN_COPY;
        this._E_CURRENT_GRAIN_COPY_CHANGED = _E_CURRENT_GRAIN_COPY_CHANGED;
        // broadcast events
        this._E_CURRENT_GRAIN_COPY_CHANGE = _E_CURRENT_GRAIN_COPY_CHANGE;
    }

    public preview(subject:ISubject) {
        
        this._grainService.getListBySubjectId(subject.id).then(
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
            },
            function(err) {
                notify.error(err);
            }
        );
        
    }
    
    public perform() {
        // TODO

        this._previewing = false;

        var self = this;
        this._eventsHandler(self);
    }

    private _eventsHandler = function(self) {

        // received events
        this._E_UPDATE_GRAIN_COPY += this._subjectCopy.id;
        this._E_CURRENT_GRAIN_COPY_CHANGED += this._subjectCopy.id;
        // broadcast events
        this._E_CURRENT_GRAIN_COPY_CHANGE += this._subjectCopy.id;

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

        self._$scope.$on(self._E_UPDATE_GRAIN_COPY, function(event, grainCopy:IGrainCopy) {
            if (!self._previewing) {
                _handleUpdateGrainCopy(grainCopy);
            } else {
                _updateLocalGrainCopyList(grainCopy);
            }
        });

        self._$scope.$on(self._E_CURRENT_GRAIN_COPY_CHANGED, function(event, grainCopy:IGrainCopy) {
            if (!self._subjectCopy.has_been_started) {
                self._subjectCopy.has_been_started = true;
            }
            self._$scope.$broadcast(self._E_CURRENT_GRAIN_COPY_CHANGE, grainCopy);
        });
        
        // init
        self._$scope.$broadcast(self._E_CURRENT_GRAIN_COPY_CHANGE, undefined);
        self._hasDataBeenLoaded = true;
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

