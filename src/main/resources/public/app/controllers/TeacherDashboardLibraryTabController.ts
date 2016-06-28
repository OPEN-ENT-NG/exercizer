class TeacherDashboardLibraryTabController {

    static $inject = [
        '$location',
        '$scope',
        'SubjectService'
    ];

    // common
    private _subjectForLibraryList:ISubject[];
    private _hasDataLoaded:boolean;

    // filters
    private _filters:{title:string, tags:string[], lesson_type:string, lesson_level:string}; // TODO tags as model ?
    private _tmpSubjectListByFilters:ISubject[];
    private _areFiltersFolded:boolean;
    
    // toaster
    private _selectedSubjectList:ISubject[];

    constructor
    (
        private _$location:ng.ILocationService,
        private _$scope:ng.IScope,
        private _subjectService:ISubjectService
    ) {
        this._$location = _$location;
        this._$scope = _$scope;
        this._subjectService = _subjectService;

        this._hasDataLoaded = false;

        // organizer
        this._areFiltersFolded = false;
        
        // toaster
        this._selectedSubjectList = [];

        var self = this;
    }

    /**
     * FILTERS
     */

    public foldFilters = function() {
        this._areFiltersFolded = !this._areFiltersFolded;
    };

    /**
     * TOASTER
     */

    public selectSubject = function(subject:ISubject) {
        var subjectIndex = this._selectedSubjectList.indexOf(subject);

        if (subjectIndex !== -1) {
            this._selectedSubjectList.splice(subjectIndex, 1);
        } else {
            this._selectedSubjectList.push(subject);
        }
    };

    public isSubjectSelected = function(subject:ISubject) {
        return this._selectedSubjectList.indexOf(subject) !== -1;
    };

    public previewSelectedSubjectList = function() {
        // TODO
    };

    public displayModalCopyPaste = function() {
        this._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE', this._selectedSubjectList, []);
    };

    private _copyPastSelectedSubjectList = function(parentFolder) {
        var self = this;

        this._subjectService.duplicateList(this._selectedSubject, parentFolder).then(
            function() {
                self._selectedSubjectList = [];
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public resetSelection = function() {
        this._selectedSubjectList = [];
    };

    public isToasterDisplayed = function() {
        return this._selectedSubjectList.length > 0;
    };

    /**
     * GETTER
     */

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }

    get areFiltersFolded():boolean {
        return this._areFiltersFolded;
    }
}

