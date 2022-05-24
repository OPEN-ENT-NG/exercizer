import { ng, notify } from 'entcore';
import { angular } from 'entcore';
import { ISubjectService, ISubjectScheduledService, ISubjectCopyService, IDateService, SubjectCopyService } from '../services';
import { ISubjectScheduled, ISubjectCopy } from '../models/domain';
import { ISubjectCopyFile } from '../models/domain/SubjectCopyFile';
import { ISubjectDocument } from '../models/domain/SubjectDocument';

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

    public saveStudentCopy() {
        this.closeConfirmModal();
        if (!this._subjectCopy.homework_files.length) {
            notify.error('exercizer.simple.check');
        } else {
            var self = this;
            this._subjectCopyService.submitSimpleCopy(this._subjectCopy.id).then(
                function (copy) {
                    self._subjectCopy.submitted_date = copy.submitted_date;
                    self._$location.path('/dashboard').search({tab: 'finished'});
                    notify.close();
                    notify.success('exercizer.notify.file.sent');
                }, function (err) {
                    notify.error(err);
                });
        }
    };
    
    public uploadFile= function(){
        if (this.newFiles.length > 0) {
            notify.info('exercizer.notify.file.loading', false);
            const self:PerformSimpleSubjectCopyController=this;
            this._subjectCopyService.addHomeworkFile(this._subjectCopy.id, this.newFiles[0]).then(
                function (file:ISubjectCopyFile) {
                    self._subjectCopy.homework_files.push( file );
                    notify.close();
                    notify.success('exercizer.navigation.success');
                }, function (err) {
                    notify.error(err);
                }
            );
        }
    };
    
    public downloadFile(file:ISubjectCopyFile) {
        const self:PerformSimpleSubjectCopyController=this;
        window.location.href = self._subjectCopyService.downloadMySimpleCopy(self._subjectCopy.id.toString(), file.file_id);
    };

    public deleteFile(file:ISubjectCopyFile) {
        const self:PerformSimpleSubjectCopyController=this;
        this._subjectCopyService.removeHomeworkFile(this._subjectCopy.id, file.file_id).then(
            function () {
                const idx = self._subjectCopy.homework_files.findIndex( f=>f.file_id===file.file_id );
                if( idx >= 0 ) {
                    self._subjectCopy.homework_files.splice( idx, 1 );
                }
            }, function (err) {
                notify.error(err);
            }
        );
    };

    public openConfirmModal = function() {
        if (this._subjectCopy.homework_files.length === 0) {
            notify.error('exercizer.simple.check');
        } else {
            this._isModalConfirmDisplayed = true;
        }
    };

    public closeConfirmModal = function() {
        this._isModalConfirmDisplayed = false;
    };

    public get canUpdate(){
        return this._subjectCopy.submitted_date === null
            && this._dateService.compare_after(this._dateService.isoToDate(this._subjectScheduled.due_date), new Date(), true);
    };

    public canHomeworkSubmit = function(){
        //it's possible to submit a homework if the begin date is passed even if due date is exceeded (Unless it has already submit)
        return this._dateService.compare_after(new Date(), this._dateService.isoToDate(this._subjectScheduled.begin_date), true)
            && this._subjectCopy.submitted_date === null;
    };
    
    public canShowFuturSubmitLabel = function(){
       return this._dateService.compare_after(this._dateService.isoToDate(this._subjectScheduled.begin_date), new Date(), false);  
    };

    public canShowGeneralCorrected = function(){
        //if subject scheduled corrected exist
        return this._subjectScheduled.files.length > 0;
    };

    public canShowIndividualCorrected = function(){
        //if subject copy corrected exist
        return this._subjectCopy.corrected_files.length > 0;
    };

    public canDownloadCorrected = function() {
        //if corrected date has passed
        return this._dateService.compare_after(new Date(), this._dateService.isoToDate(this._subjectScheduled.corrected_date), true);
    };

    public redirectToDashboard = function(){
        this._$location.path('/dashboard');
    };
    
    public downloadGeneralCorrectedFile = function(doc:ISubjectDocument) {
        window.location.href = `/exercizer/subject/${this._subjectScheduled.id}/file/${doc.doc_id}`;
    };

    public downloadCorrectedFile = function(file:ISubjectCopyFile) {
        window.location.href = `/exercizer/subject-copy/${this._subjectCopy.id}/corrected/${file.file_id}`;
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