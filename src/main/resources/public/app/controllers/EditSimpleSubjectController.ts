class EditSimpleSubjectController {

    static $inject = [
        '$routeParams',
        '$sce',
        '$scope',
        '$location',
        'SubjectService'
    ];

    // common
    private _subject:ISubject;
    private _hasDataLoaded:boolean;
    private _readOnly:boolean;
    private _isModalConfirmDisplayed:boolean;

    constructor
    (
        private _$routeParams,
        private _$sce,
        private _$scope:ng.IScope,
        private _$location:ng.ILocationService,
        private _subjectService:ISubjectService
    ) {

        this._$scope = _$scope;
        this._$sce = _$sce;
        this._$location = _$location;
        this._subjectService = _subjectService;

        this._hasDataLoaded = false;
        this._readOnly = false;
        this._isModalConfirmDisplayed = false;

        var self = this,
            subjectId = _$routeParams['subjectId'];

        this._subjectService.resolve().then(function() {
            self._subject = self._subjectService.getById(subjectId);

            if (angular.isUndefined(self._subject)) {
                self.redirectToDashboard();
            } else {
                if (self._subject && !model.me.hasRight(self._subject, 'owner') && 
                    !model.me.hasRight(self._subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager) && 
                    !model.me.hasRight(self._subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.contrib)) {
               
                    self._readOnly = true;
                }                
                
                self._hasDataLoaded = true;
            }
        }, function(err) {
            notify.error(err);
        });
    }

    public openConfirmModal = function() {
       this._isModalConfirmDisplayed = true;
    };
    
    public closeConfirmModal = function() {
        this._isModalConfirmDisplayed = false;
    }; 

    public redirectToDashboard() {
        this._$location.path('/dashboard');
    };

    public saveSubjectProperties = function() {
        if (!this._subject.title || this._subject.title.length === 0) {
            notify.error('exercizer.check.title');
        } else {
            var self = this;
            this._subjectService.update(this.subject).then(function () {
                self.closeConfirmModal();
            }, function (err) {
                notify.error(err);
            });
        }
    };

    public scheduleSubject() {
        this._$scope.$broadcast('E_DISPLAY_MODAL_SCHEDULE_SUBJECT', this._subject);
    };

    /**
     *  GETTER
     */

    get subject():ISubject {
        return this._subject;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }

    get readOnly():boolean {
        return this._readOnly;
    }

    get isModalConfirmDisplayed():boolean {
        return this._isModalConfirmDisplayed;
    }
}

