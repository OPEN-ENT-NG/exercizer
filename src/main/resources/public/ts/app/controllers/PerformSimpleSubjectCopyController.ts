import { ng, notify } from 'entcore';
import { angular } from 'entcore';
import { ISubjectService, ISubjectScheduledService, ISubjectCopyService, IDateService } from '../services';
import { ISubjectScheduled, ISubjectCopy } from '../models/domain';

class PerformSimpleSubjectCopyController {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'DateService'
    ];

    private _subjectScheduled:ISubjectScheduled;
    private _subjectCopy:ISubjectCopy;
    private _hasDataLoaded:boolean;
    private _isModalConfirmDisplayed:boolean;
    private _file:any;

    constructor
    (
        private _$routeParams,
        private _$scope,
        private _$location,
        private _subjectService:ISubjectService,
        private _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _dateService:IDateService
    ) {
        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService = _subjectCopyService;
        this._dateService = _dateService;
        this._hasDataLoaded = false;
        this._isModalConfirmDisplayed = false;

        var self = this,
            subjectCopyId = _$routeParams['subjectCopyId'];

        if (!angular.isUndefined(subjectCopyId)) {
            this._perform(subjectCopyId);
        } else {
            self._$location.path('/dashboard');
        }
    }

    private _perform(subjectCopyId:number) {
        var self = this;

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
    };

    public setCurrentFileName = function() {
        if (this.newFiles.length > 0) {
            this._file = this.newFiles[0];
            this._subjectCopy.homework_metadata = {"filename":this._file.name};
        }
    };

    public saveStudentCopy = function() {
        this.closeConfirmModal();
        if (!this._file) {
            notify.error('exercizer.simple.check');
        } else {
            var self = this;
            var file = this._file;

            notify.info('exercizer.notify.file.loading', false);

            this._subjectCopyService.persistSimpleCopy(this._subjectCopy.id, file).then(
                function (fileId) {
                    self._subjectCopy.homework_metadata = {"filename":file.name};
                    self._subjectCopy.homework_file_id = fileId;
                    self._subjectCopy.submitted_date = new Date();
                    self._$location.path('/dashboard').search({tab: 'finished'});
                    notify.close();
                    notify.success('exercizer.notify.file.sent');
                }, function (err) {
                    notify.error(err);
                });
        }
    };
    
    public openConfirmModal = function() {
        if (!this._file) {
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
            this._dateService.compare_after(this._dateService.isoToDate(this._subjectScheduled.due_date), new Date(), true);
    };

    public canHomeworkSubmit = function(){
        //it's possible to submit a homework if the begin date is passed even if due date is exceeded (Unless it has already submit)
        return this._dateService.compare_after(new Date(), this._dateService.isoToDate(this._subjectScheduled.begin_date), true) &&
            (this._subjectCopy.homework_file_id === null || this.canHomeworkReplace());
    };
    
    public canShowFuturSubmitLabel = function(){
       return this._dateService.compare_after(this._dateService.isoToDate(this._subjectScheduled.begin_date), new Date(), false);  
    };

    public canHomeworkOnlyView = function(){
        return this._subjectCopy.submitted_date !== null &&  this._subjectCopy.homework_file_id !== null &&
            this._dateService.compare_after(new Date(), this._dateService.isoToDate(this._subjectScheduled.due_date), false);
    };

    public canShowGeneralCorrected = function(){
        //if subject scheduled corrected exist
        return this._subjectScheduled.corrected_file_id !== null;
    };

    public canShowIndividualCorrected = function(){
        //if subject copy corrected exist
        return this._subjectCopy.corrected_file_id !== null;
    };

    public canDownloadCorrected = function() {
        //if corrected date has passed
        return this._dateService.compare_after(new Date(), this._dateService.isoToDate(this._subjectScheduled.corrected_date), true);
    };

    public redirectToDashboard = function(){
        this._$location.path('/dashboard');
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

    get isModalConfirmDisplayed():boolean {
        return this._isModalConfirmDisplayed;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
}

export const performSimpleSubjectCopyController = ng.controller('PerformSimpleSubjectCopyController', PerformSimpleSubjectCopyController);