class PerformSubjectController {

    static $inject = [
        '$scope',
        '$location',
        'SubjectService',
        'GrainService',
        'GrainTypeService'
        // received events
        // broadcast events
    ];

    private _subjectScheduled:ISubjectScheduled;
    private _subjectCopy:ISubjectCopy;
    private _grainCopyList:IGrainCopy[];

    constructor
    (
        private _$scope:ng.IScope,
        private _$location:ng.ILocationService,
        private _subjectService:ISubjectService,
        private _grainService:IGrainService,
        private _grainTypeService:IGrainTypeService
        // received events
        // broadcast events
    )
    {
        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._grainService = _grainService;
        this._grainTypeService = _grainTypeService;

        // received events
        // broadcast events

        var self = this;
        this._eventsHandler(self);
    }

    private _eventsHandler = function(self) {

        console.log(self._$scope);
        // init
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
}

