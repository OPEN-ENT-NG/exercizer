//declare var idiom: any;

class PerformSimpleSubjectCopyController {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectLibraryService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'DateService'
    ];

    private _subjectScheduled:ISubjectScheduled;
    private _subjectCopy:ISubjectCopy;
    private _previewingFromLibrary:boolean;
    private _hasDataLoaded:boolean;
    private _isModalConfirmDisplayed:boolean;

    constructor
    (
        private _$routeParams,
        private _$scope:ng.IScope,
        private _$location:ng.ILocationService,
        private _subjectService:ISubjectService,
        private _subjectLibraryService:ISubjectLibraryService,
        private _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _dateService:IDateService
    ) {
        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectLibraryService = _subjectLibraryService;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService =_subjectCopyService;
        this._dateService = _dateService;
        this._hasDataLoaded = false;
        this._isModalConfirmDisplayed = false;

        var self = this,
            subjectId = _$routeParams['subjectId'],
            subjectCopyId = _$routeParams['subjectCopyId'];

        if (!angular.isUndefined(subjectId)) {
            if (!angular.isUndefined(self._subjectLibraryService.tmpSubjectForPreview)) {
                self._previewFromLibrary(self._subjectLibraryService.tmpSubjectForPreview);
            } else {
                self._$location.path('/dashboard');
            }
        } else {
            if (!angular.isUndefined(subjectCopyId)) {
                this._perform(subjectCopyId);
            } else {
                self._$location.path('/dashboard');
            }
        }

    }

    private _previewFromLibrary(subject:ISubject) {
        var self = this;
        self._previewingFromLibrary = true;
        self._subjectScheduled = self._subjectScheduledService.createFromSubject(subject);
        self._hasDataLoaded = true;
        self._$scope.$on('E_CONFIRM_COPY_PASTE', function(event, folder:IFolder) {
            if (self._previewingFromLibrary) {

                let subjectIds = [];
                subjectIds.push(self._subjectLibraryService.tmpSubjectForPreview.id);

                let folderId = (folder) ? folder.id : null;

                self._subjectService.duplicateSubjectsFromLibrary(subjectIds, folderId).then(
                    function() {
                        notify.info('exercizer.simple.submit.from.library');
                        self.redirectToDashboard();
                    },
                    function(err) {
                        notify.error(err);
                    }
                );
            }
        });
    }

    private _perform(subjectCopyId:number) {
        var self = this;
        this._previewingFromLibrary = false;

        this._subjectScheduledService.resolve(false).then(
            function() {
                self._subjectCopyService.resolve(false).then(
                    function() {
                        self._subjectCopy = self._subjectCopyService.getById(subjectCopyId);

                        if (!angular.isUndefined(self._subjectCopy)) {

                            self._subjectScheduled = self._subjectScheduledService.getById(self._subjectCopy.subject_scheduled_id);

                            if (!angular.isUndefined(self._subjectScheduled)) {
                                self._hasDataLoaded = true;
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

    public displayModalCopyPaste = function() {
        if (this._previewingFromLibrary) {
            var subjectTmpArray = [];
            subjectTmpArray.push(this._subjectLibraryService.tmpSubjectForPreview);
            this._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE', subjectTmpArray, [], true);
        }
    };

    public setCurrentFileName = function() {
        if (this.newFiles.length > 0) {
            var file = this.newFiles[0];
            this._subjectCopy.homework_metadata = {"filename":file.name};
        }
    };

    public saveStudentCopy = function() {
        this.closeConfirmModal();
        if (!this.newFiles || this.newFiles.length === 0) {
            notify.error('exercizer.simple.check');
        } else {
            var self = this;
            var file = this.newFiles[0];
            this._subjectCopyService.persistSimpleCopy(this._subjectCopy.id, file).then(
                function (fileId) {
                    self._subjectCopy.homework_metadata = {"filename":file.name};
                    self._subjectCopy.homework_file_id = fileId;
                    self._subjectCopy.submitted_date = new Date();
                    self.redirectToDashboard();
                }, function (err) {
                    notify.error(err);
                });
        }
    };
    
    public openConfirmModal = function() {
        if (!this.newFiles || this.newFiles.length === 0) {
            if (this._subjectCopy.homework_file_id === null) {
                notify.error('exercizer.simple.check.renew');
            } else {
                notify.error('exercizer.simple.check');
            }
        } else {
            this._isModalConfirmDisplayed = true;
        }       
    };

    public closeConfirmModal = function() {
        this._isModalConfirmDisplayed = false;
    };

    public canHomeworkReplace = function(){
        return this._subjectCopy.submitted_date !== null &&  this._subjectCopy.homework_file_id !== null &&
            this._dateService.compare_after(this._dateService.isoToDate(this._subjectScheduled.due_date), new Date(), false);
    };

    public canHomeworkSubmit = function(){
        //if no preview else it's possible to submit a homework even if due date is exceeded (Unless it has already submit)
        return !this._previewingFromLibrary && (this._subjectCopy.homework_file_id === null || this.canHomeworkReplace());
    };

    public canHomeworkOnlyView = function(){
        return !this._previewingFromLibrary && this._subjectCopy.submitted_date !== null &&  this._subjectCopy.homework_file_id !== null &&
            this._dateService.compare_after(new Date(), this._dateService.isoToDate(this._subjectScheduled.due_date), false);
    };

    public canShowGeneralCorrected = function(){
        //if no preview and corrected date has passed and subject scheduled corrected exist
        return  this.canShowCorrected() && this._subjectScheduled.corrected_file_id !== null;
    };

    public canShowIndividualCorrected = function(){
        //if no preview and corrected date has passed and subject copy corrected exist
        return this.canShowCorrected() && this._subjectCopy.corrected_file_id !== null;
    };

    private canShowCorrected = function() {
        //if no preview and corrected date has passed
        return  !this._previewingFromLibrary && this._dateService.compare_after(new Date(), this._dateService.isoToDate(this._subjectScheduled.corrected_date), false);
    };

    public redirectToDashboard = function(){
        if (this._previewingFromLibrary) {
            this._$location.path('/dashboard/teacher/library');
        } else {
            this._$location.path('/dashboard');
        }
    };
    
    public downloadGeneralCorrectedFile = function() {
        window.location.href = '/exercizer/subject-scheduled/corrected/download/' + this._subjectScheduled.id;
    };

    public downloadCorrectedFile = function() {
        window.location.href = '/exercizer/subject-copy/corrected/download/' + this._subjectCopy.id;
    };

    get subjectScheduled():ISubjectScheduled {
        return this._subjectScheduled;
    }

    get subjectCopy():ISubjectCopy {
        return this._subjectCopy;
    }

    get previewingFromLibrary():boolean {
        return this._previewingFromLibrary;
    }

    get isModalConfirmDisplayed():boolean {
        return this._isModalConfirmDisplayed;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
}
