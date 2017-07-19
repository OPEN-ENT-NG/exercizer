import { ng, idiom, model, Behaviours, notify } from 'entcore';
import { angular } from 'entcore/libs/angular/angular';
import { ISubject, IFolder, Subject, ISubjectScheduled } from '../models/domain';
import { ISubjectService, ISubjectLibraryService } from '../services';

class EditSimpleSubjectController {

    static $inject = [
        '$routeParams',
        '$sce',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectLibraryService'
    ];

    // common
    private _subject:ISubject;
    private _subjectScheduled:ISubjectScheduled;
    private _hasDataLoaded:boolean;
    private _previewingFromLibrary:boolean;
    private _readOnly:boolean;
    private _defaultTitle:string;

    constructor
    (
        private _$routeParams,
        private _$sce,
        private _$scope,
        private _$location,
        private _subjectService:ISubjectService,
        private _subjectLibraryService:ISubjectLibraryService      
    ) {

        this._$scope = _$scope;
        this._$sce = _$sce;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectLibraryService = _subjectLibraryService;

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
                    self._hasDataLoaded = true;
                }
            }, function(err) {
                notify.error(err);
            });
        } else {
            //new subject
            self._subject = new Subject();
            self._subject.type = 'simple';
            self._subject.title = self._defaultTitle;
            self._previewingFromLibrary = false;
            self._hasDataLoaded = true;
            self.createSubject();
        }
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

    private createSubject = function() {
        var self = this;
        self._subjectService.persist(this._subject).then(function (subject) {
            self._subject = subject;
        }, function (err) {
            notify.error(err);
        });
    };

    public saveSubjectProperties = function() {
        if (this._subject.id) {
            if (!this._subject.title || this._subject.title.length === 0) {
                this._subject.title = this._defaultTitle;
            }
            this._subjectService.update(this._subject).then(function () {}, function (err) {
                notify.error(err);
            });
        }
    };

    public downloadCorrectedFile = function() {
        window.location.href = '/exercizer/subject/simple/corrected/download/' + this._subject.id;
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

    get previewingFromLibrary():boolean {
        return this._previewingFromLibrary;
    }
}

export const editSimpleSubjectController = ng.controller('EditSimpleSubjectController', EditSimpleSubjectController);