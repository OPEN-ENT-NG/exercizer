class EditSubjectController {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectEditService',
        'GrainService'
    ];

    private _subject:ISubject;
    private _hasDataLoaded:boolean;

    constructor
    (
        private _$routeParams,
        private _$scope:ng.IScope,
        private _$location:ng.ILocationService,
        private _subjectService:ISubjectService,
        private _subjectEditService:ISubjectEditService,
        private _grainService:IGrainService
    ) {

        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._grainService = _grainService;

        this._hasDataLoaded = false;

        var self = this,
            subjectId = _$routeParams['subjectId'];

        this._subjectService.resolve().then(function() {
            self._subject = self._subjectService.getById(subjectId);

            if (angular.isUndefined(self._subject)) {
                self.redirectToDashboard();
            } else {
                self._grainService.getListBySubject(self._subject).then(
                    function (grainList) {
                        _subjectEditService.reset();
                        self._hasDataLoaded = true;
                    },
                    function (err) {
                        notify.error(err);
                    }
                );
            }
        }, function(err) {
            notify.error(err);
        });
    }

    public redirectToDashboard() {
        this._$location.path('/dashboard');
    }

    get subject():ISubject {
        return this._subject;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
}

