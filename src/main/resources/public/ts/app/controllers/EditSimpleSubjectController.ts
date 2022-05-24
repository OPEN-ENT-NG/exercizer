import { ng, idiom, model, Behaviours, notify, EditTrackingEvent, trackingService } from 'entcore';
import { angular } from 'entcore';
import { ISubject, IFolder, Subject, ISubjectScheduled } from '../models/domain';
import { ISubjectDocument } from '../models/domain/SubjectDocument';
import { ISubjectService, ISubjectLibraryService, ISubjectScheduledService } from '../services';

class EditSimpleSubjectController {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectLibraryService',
        'SubjectScheduledService',
    ];

    // common
    private _subject:ISubject;
    private _subjectScheduled:ISubjectScheduled;
    private _hasDataLoaded:boolean;
    private _previewingFromLibrary:boolean;
    private _readOnly:boolean;
    private _defaultTitle:string;
    public fileSelectionDisplayed = false;
    public selectedFile = { file: {}, visibility: 'protected' };

    constructor
    (
        _$routeParams,
        private _$scope,
        private _$location,
        private _subjectService:ISubjectService,
        private _subjectLibraryService:ISubjectLibraryService,
        private _subjectScheduledService:ISubjectScheduledService
    ) {
        this._defaultTitle = idiom.translate('exercizer.simple.default.title');
        this._hasDataLoaded = false;
        this._readOnly = false;

        var self = this,
            subjectId = _$routeParams['subjectId'],
            subjectPreviewId =  _$routeParams['subjectPreviewId'];

        if (subjectPreviewId) {
            if (!angular.isUndefined(self._subjectLibraryService.tmpSubjectForPreview)) {
                var subjectPreview:any = self._subjectLibraryService.tmpSubjectForPreview;
                subjectPreview.corrected_metadata = JSON.parse(subjectPreview.corrected_metadata);
                self._previewFromLibrary(subjectPreview);
            } else {
                self.redirectToDashboard();
            }
        } else if (subjectId) {
            this._subjectService.resolve().then(function() {
                self._subject = self._subjectService.getById(subjectId);

                if (angular.isUndefined(self._subject)) {
                    self.redirectToDashboard();
                } else {
                    if (self._subject && !model.me.hasRight(self._subject, 'owner') && !model.me.hasRight(self._subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager) && !model.me.hasRight(self._subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.contrib)) {
                        self._readOnly = true;
                    }

                    self._previewingFromLibrary = false;
                    self._subjectService.listFiles(self._subject.id).then( function(files) {
                        self._subject.files = files;
                        self._hasDataLoaded = true;
                    }, function(err) {
                        self._hasDataLoaded = true; // Error, but users has already been notified.
                    });
                }
            }, function(err) {
                notify.error(err);
            });
        } else {
            //new subject
            var folderId = _$routeParams['folderId'];
            self._subject = new Subject();
            self._subject.type = 'simple';
            self._subject.title = '';
            if (folderId) {
                self._subject.folder_id = folderId;
            }
            self._previewingFromLibrary = false;
            self._hasDataLoaded = true;
            self.createSubject();
        }
    }

    getTracker():EditTrackingEvent{
        return this.subject.getTracker();
    }

    private _previewFromLibrary(subject:ISubject) {
        var self = this;
        self._readOnly = true;
        self._previewingFromLibrary = true;
        self._subject = subject;
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
    };

    public displayModalCopyPaste = function() {
        if (this._previewingFromLibrary) {
            var subjectTmpArray = [];
            subjectTmpArray.push(this._subjectLibraryService.tmpSubjectForPreview);
            this._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE', subjectTmpArray, [], true);
        }
    };

    public redirectToDashboard() {
        if (this._previewingFromLibrary) {
            this._$location.path('/dashboard/teacher/library');
        } else {
            this._$location.path('/dashboard');
        }
    };

    private createSubject = () => {
        var self = this;
        this.getTracker().onStop();
        self._subjectService.persist(this._subject).then(function (subject) {
            self._subject = subject;
            self.getTracker().onFinish(true);
        }, function (err) {
            notify.error(err);
            self.getTracker().onFinish(false);
        });
    };

    public saveSubjectProperties = () => {
        if (this._subject.id) {
            if (!this._subject.title || this._subject.title.length === 0) {
                this._subject.title = this._defaultTitle;
            }
            this.getTracker().onStop();
            this._subjectService.update(this._subject, undefined).then( () => {
                this.getTracker().onFinish(true);
            },  (err) => {
                notify.error(err);
                this.getTracker().onFinish(false);
            });
        }
    };

    public initTitle = function() {
        if (this._subject.title === this._defaultTitle) {
            this._subject.title = "";
        }
    };

    public appendCorrected() {
        const file = this.selectedFile.file;
        if(!file){
            return;
        }
        this._subjectScheduledService.addCorrectedFile(this._subject.id, file).then(
            (doc:ISubjectDocument) => {
                this._subject.files.push(doc);
                notify.info('exercizer.service.save.corrected');
            },
            (err) => {
                notify.error(err);
            }
        );
    };

    public removeCorrected(file:ISubjectDocument) {
        this._subjectScheduledService.removeCorrectedFile(this._subject.id, file.doc_id).then(
            (res) => {
                const idx = this._subject.files.findIndex( f => f.doc_id===file.doc_id );
                if( idx >= 0 ) {
                    this._subject.files.splice( idx, 1 );
                }
                notify.info('exercizer.service.delete.corrected');
            },
            (err) => {
                notify.error(err);
            }
        );
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

    get hasDefaultImage():boolean {
        return !this._subject.picture;
    }

    get readOnly():boolean {
        return this._readOnly;
    }

    get previewingFromLibrary():boolean {
        return this._previewingFromLibrary;
    }
}

export const editSimpleSubjectController = ng.controller('EditSimpleSubjectController', EditSimpleSubjectController);