class TeacherDashboardLibraryTabController {

    static $inject = [
        '$q',
        '$location',
        '$scope',
        'SubjectService',
        'SubjectLibraryService',
        'SubjectLessonTypeService',
        'SubjectLessonLevelService',
        'SubjectTagService'
    ];

    // common
    private _subjectList:ISubject[];
    private _hasDataLoaded:boolean;
    private _isLanding:boolean;

    // filters
    private _filters:{title:string, subjectLessonTypeList:ISubjectLessonType[], subjectLessonLevelList:ISubjectLessonLevel[], subjectTagList:ISubjectTag[]};

    private _subjectLessonTypeList:ISubjectLessonType[];
    private _subjectLessonLevelList:ISubjectLessonLevel[];

    private _subjectTagList:ISubjectTag[];
    private _autocompleteSubjectTagList:any[];

    private _areFiltersFolded:boolean;
    private _isFilterSubjectLessonTypeDisplayed:boolean;
    private _isFilterSubjectLessonLevelDisplayed:boolean;

    // toaster
    private _selectedSubjectList:ISubject[];

    constructor
    (
        private _$q:ng.IQService,
        private _$location:ng.ILocationService,
        private _$scope:ng.IScope,
        private _subjectService:ISubjectService,
        private _subjectLibraryService:ISubjectLibraryService,
        private _subjectLessonTypeService:ISubjectLessonTypeService,
        private _subjectLessonLevelService:ISubjectLessonLevelService,
        private _subjectTagService:ISubjectTagService
    ) {
        this._$q = _$q;
        this._$location = _$location;
        this._$scope = _$scope;
        this._subjectService = _subjectService;
        this._subjectLibraryService = _subjectLibraryService;
        this._subjectLessonTypeService = _subjectLessonTypeService;
        this._subjectLessonLevelService = _subjectLessonLevelService;
        this._subjectTagService = _subjectTagService;

        // common
        this._hasDataLoaded = false;
        this._isLanding = true;

        // filters
        this._filters = {
            title: undefined,
            subjectLessonTypeList: [],
            subjectLessonLevelList: [],
            subjectTagList: []
        };
        this._areFiltersFolded = false;
        this._isFilterSubjectLessonTypeDisplayed = true;
        this._isFilterSubjectLessonLevelDisplayed = false;

        // toaster
        this._selectedSubjectList = [];

        var self = this;
        this._subjectLibraryService.search(/*this._filters*/).then(
            function(subjectList:ISubject[]) {
                self._subjectList = subjectList;

                self._subjectLessonTypeService.resolve().then(
                    function() {
                        self._subjectLessonTypeList = self._subjectLessonTypeService.getList();

                        self._subjectLessonLevelService.resolve().then(
                            function() {
                                self._subjectLessonLevelList = self._subjectLessonLevelService.getList();

                                self._subjectTagService.resolve().then(
                                    function(subjectTagList:ISubjectTag[]) {
                                        self._subjectTagList = subjectTagList;
                                        self._autocompleteSubjectTagList = [];

                                        angular.forEach(self._subjectTagList, function(value) {
                                            var obj = {
                                                id: value.id,
                                                label: value.label,
                                                toString: function () {
                                                    return this.label;
                                                }
                                            };
                                            self._autocompleteSubjectTagList.push(obj);
                                        });

                                        var promises = [],
                                            subjectIdList = self._subjectList.map(function(subject:ISubject) {
                                                return subject.id;
                                            });

                                        angular.forEach(subjectIdList, function(subjectId:number) {
                                            promises.push(self._subjectTagService.resolveBySubjectId(subjectId));
                                        });

                                        promises.push(self._subjectLessonTypeService.resolveBySubjectIdList(angular.copy(subjectIdList)));
                                        promises.push(self._subjectLessonLevelService.resolveBySubjectIdList(angular.copy(subjectIdList)));

                                        self._$q.all(promises).then(
                                            function() {

                                                self._$scope.$on('E_CONFIRM_COPY_PASTE', function(event, folder:IFolder) {
                                                    self._copyPastSelectedSubjectList(folder);
                                                });

                                                self._hasDataLoaded = true;
                                            },
                                            function(err) {
                                                notify.error(err);
                                            }
                                        );
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                );
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    },
                    function(err) {
                        notify.error(err);
                    }
                );
            },
            function(err) {
                notify.error(err);
            }
        );
    }

    /**
     * COMMON
     */

    public getSubjectPicture = function(subject:ISubject) {
        return subject.picture || '/assets/themes/leo/img/illustrations/poll-default.png';
    };

    public getSubjectLessonType = function(subject:ISubject) {
        return this._subjectLessonTypeService.getBySubjectId(subject.id);
    };

    public getSubjectLessonLevel = function(subject:ISubject) {
        return this._subjectLessonLevelService.getBySubjectId(subject.id);
    };

    public getSubjectTags = function(subject:ISubject) {
        return this._subjectTagService.getListBySubjectId(subject.id);
    };

    /**
     * FILTERS
     */

    public searchByFilters = function() {
        var self = this;
        return function (subject:ISubject) {

            if (angular.isUndefined(subject)) {
                return false;
            }

            var titleFound = true,
                subjectLessonTypeFound = true,
                subjectLessonLevelFound = true,
                subjectTagListFound = true;

            if (!angular.isUndefined(self._filters.title) && self._filters.title.length > 0) {
                self._isLanding = false;
                titleFound = subject.title.toLowerCase().search(self._filters.title.toLowerCase()) !== -1;
            }

            if (self._filters.subjectLessonTypeList.length > 0) {

                var currentSubjectLessonType = self._subjectLessonTypeService.getBySubjectId(subject.id);
                subjectLessonTypeFound = false;
                self._isLanding = false;

                for (var i = 0; i < self._filters.subjectLessonTypeList.length && !subjectLessonTypeFound; ++i) {
                    subjectLessonTypeFound = currentSubjectLessonType.id === self._filters.subjectLessonTypeList[i].id;
                }
            }

            if (self._filters.subjectLessonLevelList.length > 0) {

                var currentSubjectLessonLevel = self._subjectLessonLevelService.getBySubjectId(subject.id);
                subjectLessonLevelFound = false;
                self._isLanding = false;

                for (var i = 0; i < self._filters.subjectLessonLevelList.length && !subjectLessonLevelFound; ++i) {
                    subjectLessonLevelFound = currentSubjectLessonLevel.id === self._filters.subjectLessonLevelList[i].id;
                }
            }

            if (self._filters.subjectTagList.length > 0) {

                var currentSubjectTagList = self._subjectTagService.getListBySubjectId(subject.id);
                subjectTagListFound = false;
                self._isLanding = false;

                if (currentSubjectTagList.length > 0) {

                    for (var i = 0; i < currentSubjectTagList.length && !subjectTagListFound; ++i) {
                        for (var j = 0; j < self._filters.subjectTagList.length && !subjectTagListFound; ++j) {
                            subjectTagListFound = currentSubjectTagList[i].id === self._filters.subjectTagList[j].id;
                        }
                    }
                }
            }

            return titleFound && subjectLessonTypeFound && subjectLessonLevelFound && subjectTagListFound;
        };
    };

    public foldFilters = function() {
        this._areFiltersFolded = !this._areFiltersFolded;
    };

    public displayFilterSubjectLessonType = function() {
        this._isFilterSubjectLessonLevelDisplayed = false;
        this._isFilterSubjectLessonTypeDisplayed = true;
    };

    public displayFilterSubjectLessonLevel = function() {
        this._isFilterSubjectLessonLevelDisplayed = true;
        this._isFilterSubjectLessonTypeDisplayed = false;
    };

    public selectFilterSubjectLessonType = function(subjectLessonType:ISubjectLessonType) {
        var subectLessonTypeIndex = this._filters.subjectLessonTypeList.indexOf(subjectLessonType);
        if (subectLessonTypeIndex === -1) {
            this._filters.subjectLessonTypeList.push(subjectLessonType);
        } else {
            this._filters.subjectLessonTypeList.splice(subectLessonTypeIndex, 1);
        }
    };

    public isFilterSubjectLessonTypeSelected = function(subjectLessonType:ISubjectLessonType) {
        return this._filters.subjectLessonTypeList.indexOf(subjectLessonType) !== -1;
    };

    public selectFilterSubjectLessonLevel = function(subjectLessonLevel:ISubjectLessonLevel) {
        var subectLessonLevelIndex = this._filters.subjectLessonLevelList.indexOf(subjectLessonLevel);
        if (subectLessonLevelIndex === -1) {
            this._filters.subjectLessonLevelList.push(subjectLessonLevel);
        } else {
            this._filters.subjectLessonLevelList.splice(subectLessonLevelIndex, 1);
        }
    };

    public isFilterSubjectLessonLevelSelected = function(subjectLessonLevel:ISubjectLessonLevel) {
        return this._filters.subjectLessonLevelList.indexOf(subjectLessonLevel) !== -1;
    };

    public selectSubjectTag = function(selectedSubjectTagObject) {
        for (var i = 0; i < this._subjectTagList.length; ++i) {

            if (this._subjectTagList[i].id === parseInt(selectedSubjectTagObject.id)) {

                if (this._filters.subjectTagList.indexOf(this._subjectTagList[i]) === -1) {
                    this._filters.subjectTagList.push(this._subjectTagList[i]);
                } else {
                    notify.info('Ce tag est déjà dans la associé à la recherche.')
                }

                i = this._subjectTagList.length;
            }
        }
    };

    public removeFromSelectedSubjectTagList = function(subjectTag:ISubjectTag) {
        var subjectTagIndex = this._filters.subjectTagList.indexOf(subjectTag);
        this._filters.subjectTagList.splice(subjectTagIndex, 1);
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

    public previewSelectedSubject = function(subject:ISubject = undefined) {
        if (angular.isUndefined(subject)) {
            subject = this._selectedSubjectList[0];
        }
        this._subjectLibraryService.tmpSubjectForPreview = subject;
        this._$location.path('/subject/copy/preview/perform/' + subject.id + '/');
            
    };

    public displayModalCopyPaste = function() {
        this._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE', this._selectedSubjectList, [], true);
    };

    private _copyPastSelectedSubjectList = function(parentFolder) {
        var self = this;

        angular.forEach(this._selectedSubjectList, function(subject:ISubject) {
            subject.is_library_subject = false;
        });

        this._subjectService.duplicateList(this._selectedSubjectList, parentFolder).then(
            function() {
                self._selectedSubjectList = [];
                notify.info('Les sujets ont bien été ajoutés dans votre liste des sujets.')
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public resetSelection = function() {
        this._selectedSubjectList = [];
    };

    public onlyOneSubjectIsSelected = function() {
        return this._selectedSubjectList.length === 1;
    };

    public isToasterDisplayed = function() {
        return this._selectedSubjectList.length > 0;
    };

    /**
     * GETTER
     */

    get subjectList():ISubject[] {
        return this._subjectList;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }

    get isLanding():boolean {
        return this._isLanding;
    }

    get filters():{title:string, subjectLessonTypeList:ISubjectLessonType[], subjectLessonLevelList:ISubjectLessonLevel[], subjectTagList:ISubjectTag[]} {
        return this._filters;
    }

    get subjectLessonTypeList():ISubjectLessonType[] {
        return this._subjectLessonTypeList;
    }

    get subjectLessonLevelList():ISubjectLessonLevel[] {
        return this._subjectLessonLevelList;
    }

    get autocompleteSubjectTagList():any[] {
        return this._autocompleteSubjectTagList;
    }

    get areFiltersFolded():boolean {
        return this._areFiltersFolded;
    }

    get isFilterSubjectLessonTypeDisplayed():boolean {
        return this._isFilterSubjectLessonTypeDisplayed;
    }

    get isFilterSubjectLessonLevelDisplayed():boolean {
        return this._isFilterSubjectLessonLevelDisplayed;
    }
}

