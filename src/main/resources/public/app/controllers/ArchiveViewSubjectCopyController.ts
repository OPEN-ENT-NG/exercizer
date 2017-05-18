class ArchiveViewSubjectCopyController {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'GrainScheduledService',
        'GrainCopyService',
        'ArchivesService'
    ];

    private _subjectScheduled:ISubjectScheduled;
    private _subjectCopy:ISubjectCopy;
    private _grainScheduledList:IGrainScheduled[];
    private _grainCopyList:IGrainCopy[];
    private _hasDataLoaded:boolean;

    constructor
    (
        private _$routeParams,
        private _$scope,
        private _$location:ng.ILocationService,
        private _grainScheduledService:IGrainScheduledService,
        private _grainCopyService:IGrainCopyService,
        private _archivesService
    ) {
        this._$scope = _$scope;
        this._$location = _$location;
        this._grainScheduledService = _grainScheduledService;
        this._grainCopyService = _grainCopyService;
        this._hasDataLoaded = false;
        this._archivesService = _archivesService;

        var subjectId = _$routeParams['subjectId'],
            subjectCopyId = _$routeParams['subjectCopyId'];
        this._subjectCopy = this._archivesService.getCurrentcopy();

        if (angular.isUndefined(this._subjectCopy) || this._subjectCopy.id != subjectCopyId) {
            this._$location.path('/dashboard/teacher/archive/' + subjectId);
        }
            this._subjectScheduled = this._archivesService.getSubjectScheduledById(subjectId);
            this._grainCopyService.getListBySubjectCopy(this._subjectCopy).then(
                (grainCopyList: IGrainCopy[]) => {

                    if (!angular.isUndefined(grainCopyList)) {
                        this._grainCopyList = grainCopyList;

                        this._grainScheduledService.getListBySubjectScheduled(this._subjectScheduled).then(
                            (grainScheduledList: IGrainScheduled[]) => {

                                if (!angular.isUndefined(grainScheduledList)) {
                                    this._grainScheduledList = grainScheduledList;
                                    this._hasDataLoaded = true;
                                } else {
                                    this._$location.path('/dashboard');
                                }

                            },
                            function (err) {
                                notify.error(err);
                            }
                        );
                    } else {
                        this._$location.path('/dashboard');
                    }

                },
                function (err) {
                    notify.error(err);
                }
            );
    }
    public clickReturnExercizer(){
        this._$location.path('/dashboard');
    }

    public clickReturnArchive(){
        this._$scope.selectedSubjectScheduled = undefined;
        this._$location.path('/dashboard/teacher/archive');
    }

    public clickReturnList(){
        this._$location.path('/dashboard/teacher/archive/'+this.subjectScheduled.id);
    }

    public getSubjectSelectedTitle():string{
        return this._subjectScheduled.title
    }

    public getOwnerName():string{
        return this._subjectCopy.owner_username;
    }

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

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
}

