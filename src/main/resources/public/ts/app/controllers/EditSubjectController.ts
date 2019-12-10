import { ng, idiom, notify } from 'entcore';
import { ISubject, IGrain, IGrainDocument, GrainData, GrainDocument, Grain } from '../models/domain';
import { ISubjectService, ISubjectScheduledService, ISubjectCopyService, IGrainTypeService, IGrainService, IDragService } from '../services';
import { StringISOHelper, CorrectOrderHelper } from '../models/helpers';
import { angular } from 'entcore';
import { $ } from 'entcore';
import { _ } from 'entcore';

export class EditSubjectController {

    static $inject = [
        '$routeParams',
        '$sce',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainService',
        'GrainTypeService',
        'DragService'
    ];

    // common
    private _subject:ISubject;
    private _grainList:IGrain[];
    private _selectedGrainList:IGrain[];
    private _foldedGrainList:IGrain[];
    private _hasDataLoaded:boolean;

    // statement trusted html
    private _trustedHtmlStatementMap:{[grainId:number]:string};

    // modal
    private _isModalAddGrainDocumentDisplayed:boolean;
    private _isDropableZone:boolean;
    private _isModalRemoveGrainDocumentDisplayed:boolean;
    private _isModalRemoveSelectedGrainListDisplayed:boolean;
    private _currentGrainForAction:IGrain;
    private _currentGrainDocumentToRemove:IGrainDocument;

    // organizer
    private _isOrganizerFolded:boolean;
    private _reOrderIterationCount:number;

    constructor
    (
        private _$routeParams,
        protected _$sce,
        private _$scope,
        private _$location,
        private _subjectService:ISubjectService,
        protected _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _grainService:IGrainService,
        private _grainTypeService:IGrainTypeService,
        private _dragService:IDragService
    ) {

        this._$scope = _$scope;
        this._$sce = _$sce;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService = _subjectCopyService;
        this._grainService = _grainService;
        this._grainTypeService = _grainTypeService;
        this._dragService = _dragService;

        this._hasDataLoaded = false;

        // statement trusted html
        this._trustedHtmlStatementMap = {};

        // modal
        this._isModalRemoveSelectedGrainListDisplayed = false;
        this._isDropableZone = false;
        this._isModalAddGrainDocumentDisplayed = false;
        this._isModalRemoveGrainDocumentDisplayed = false;
        this._currentGrainForAction = undefined;
        this._currentGrainDocumentToRemove = undefined;

        // organizer
        this._isOrganizerFolded = false;
        this._reOrderIterationCount = 0;

        _$scope.$root.$on('E_SUBJECTEDIT_DROPABLE_ACTIVATED', function(event, displayDropZone:boolean) {
            self._isDropableZone = displayDropZone;
        });

        var self = this,
            subjectId = _$routeParams['subjectId'];

        this._subjectService.resolve().then(function() {
            self._subject = self._subjectService.getById(subjectId);

            if (angular.isUndefined(self._subject)) {
                self.redirectToDashboard();
            } else {
                self._grainService.getListBySubject(self._subject).then(
                    function (grainList) {
                        self._grainList = grainList;
                        self._selectedGrainList = [];
                        self._foldedGrainList = [];
                        self.foldAllGrain();

                        self._$scope.$on('E_UPDATE_GRAIN', function(event, grain:IGrain) {
                            self.updateGrain(grain);
                        });

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

    /**
     * COMMON
     */

    public redirectToDashboard() {
        this._$location.path('/dashboard');
    };

    public translate = function(key) {
        return idiom.translate(key);
    };

    public scheduleSubject() {
        this._$scope.$broadcast('E_DISPLAY_MODAL_SCHEDULE_SUBJECT', this._subject);
    }

    public getGrainDisplayedName = function (grain) {
        let toIsoTitle = '';
        if (grain.grain_data.title !== undefined) {
            toIsoTitle = grain.grain_data.title;
        }
        else {
            toIsoTitle = this.getGrainPublicName(grain.grain_type_id)
        }
        return toIsoTitle;
    };

    public getGrainIllustrationURL = function(grainTypeId) {
        return this._grainTypeService.getIllustrationURL(grainTypeId);
    };

    public getGrainPublicName = function(grainTypeId) {
        return this._grainTypeService.getPublicName(grainTypeId);
    };

    public getStatementTrustedHtml = function(grain:IGrain) {
        if (angular.isUndefined(this._trustedHtmlStatementMap[grain.id]) && grain.grain_data.custom_data) {
            this._trustedHtmlStatementMap[grain.id] = this._$sce.trustAsHtml(grain.grain_data.custom_data.statement);
        }
        return this._trustedHtmlStatementMap[grain.id];
    };

    public dropTo = function($item) {
        var self = this;

        this._grainService.duplicate($item, this._subject).then(
            function(grainDuplicated) {
                self._$scope.$$postDigest(function() {
                    $('html, body').animate({ scrollTop: $('#grain-edit-' + grainDuplicated.id).offset().top - 100}, 500);
                });

            },
            function(err) {
                notify.error(err);
            }
        )

        self._isDropableZone = false;
    };

    /*public dropTo = function($originalEvent) {
        var dataField = this._dragService.dropConditionFunction(this._subject, $originalEvent),
            originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField)),
            self = this;

        this._grainService.duplicate(originalItem, this._subject).then(
            function(grainDuplicated) {
                self._$scope.$$postDigest(function() {
                    $('html, body').animate({ scrollTop: $('#grain-edit-' + grainDuplicated.id).offset().top - 100}, 500);
                });

            },
            function(err) {
                notify.error(err);
            }
        )
    };*/

    /**
     *  GRAIN
     */

    public addGrain = function() {
        var self = this,
            newGrain = new Grain();

        newGrain.subject_id = this.subject.id;
        newGrain.grain_data = new GrainData();
        newGrain.grain_type_id = 1;
        newGrain.grain_data.title = this._grainTypeService.getById(newGrain.grain_type_id).public_name;

        this._grainService.persist(newGrain).then(
            function () {
            },
            function (err) {
                notify.error(err);
            }
        );
    };

    public updateGrain = function(grain:IGrain) {
        var self = this;

        if (grain.grain_type_id > 3) {

            grain.grain_data.title = StringISOHelper.toISO(grain.grain_data.title);
            grain.grain_data.statement = StringISOHelper.toISO(grain.grain_data.statement);
            grain.grain_data.answer_explanation = StringISOHelper.toISO(grain.grain_data.answer_explanation);
            grain.grain_data.answer_hint = StringISOHelper.toISO(grain.grain_data.answer_hint);
            grain.grain_data.max_score = angular.isUndefined(grain.grain_data.max_score) ? 0 : parseFloat(parseFloat(String(grain.grain_data.max_score).replace(',', '.')).toFixed(2));
            if (isNaN(grain.grain_data.max_score)) grain.grain_data.max_score = 0;

        } else if (grain.grain_type_id === 3) {

            this._trustedHtmlStatementMap[grain.id] = undefined;

            /*if (angular.isUndefined(this._trustedHtmlStatementMap[grain.id]) && grain.grain_data.custom_data) {
             this._trustedHtmlStatementMap[grain.id] = this._$sce.trustAsHtml(grain.grain_data.custom_data.statement);
             } else{

             }*/
            //this._trustedHtmlStatementMap[grain.id] = this._$sce.trustAsHtml(grain.grain_data.custom_data.statement);
        }

        this._grainService.update(grain).then(
            function() {
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public addGrainDocument = function(mediaLibraryItem:any) {
        var grainDocument = new GrainDocument(),
            self = this;

        grainDocument.id = mediaLibraryItem._id;
        grainDocument.owner = mediaLibraryItem.owner;
        grainDocument.ownerName = mediaLibraryItem.ownerName;
        grainDocument.created = mediaLibraryItem.created ? mediaLibraryItem.created.toISOString() : null;
        grainDocument.title = mediaLibraryItem.title;
        grainDocument.name = mediaLibraryItem.name;
        grainDocument.path = '/workspace/document/' + grainDocument.id;

        if (angular.isUndefined(this._currentGrainForAction.grain_data.document_list)) {
            this._currentGrainForAction.grain_data.document_list = [];
        }

        this._currentGrainForAction.grain_data.document_list.push(grainDocument);

        this._grainService.update(this._currentGrainForAction).then(
            function() {
                self._currentGrainForAction = undefined;
                self._isModalAddGrainDocumentDisplayed = false;
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public displayModalAddGrainDocument = function(grain:IGrain) {
        this._currentGrainForAction = grain;
        this._isModalAddGrainDocumentDisplayed = true;
    };

    public closeModalAddGrainDocument = function() {
        this._currentGrainForAction = undefined;
        this._isModalAddGrainDocumentDisplayed = false;
    };

    public removeGrainDocument = function() {
        var grainDocumentIndex = this._currentGrainForAction.grain_data.document_list.indexOf(this._currentGrainDocumentToRemove),
            self = this;

        if (grainDocumentIndex !== -1) {
            this._currentGrainForAction.grain_data.document_list.splice(grainDocumentIndex, 1);
            this._grainService.update(this._currentGrainForAction).then(
                function() {
                    self._currentGrainForAction = undefined;
                    self._currentGrainDocumentToRemove = undefined;
                    self._isModalRemoveGrainDocumentDisplayed = false;
                },
                function(err) {
                    notify.error(err);
                }
            );
        }
    };

    public displayModalRemoveGrainDocument = function(grain:IGrain, grainDocument:IGrainDocument) {
        this._currentGrainForAction = grain;
        this._currentGrainDocumentToRemove = grainDocument;
        this._isModalRemoveGrainDocumentDisplayed = true;
    };

    public closeModalRemoveGrainDocument = function() {
        this._currentGrainForAction = undefined;
        this._currentGrainDocumentToRemove = undefined;
        this._isModalRemoveGrainDocumentDisplayed = false;
    };

    public foldGrain = function(grain:IGrain) {
        var grainIndexInFoldedList = this._foldedGrainList.indexOf(grain);

        if (grainIndexInFoldedList !== -1) {
            this._foldedGrainList.splice(grainIndexInFoldedList, 1);
        } else {
            this._foldedGrainList.push(grain);
        }
    };

    public isGrainFolded = function(grain:IGrain) {
        return this._foldedGrainList.indexOf(grain) !== -1;
    };

    public getCorrectOrder(grain:IGrain) {
        return CorrectOrderHelper.getCorrectOrder(grain, this._grainList);
    };


    /**
     * ORGANIZER
     */

    public foldAllGrain = function() {
        this.foldAllGrainWithoutScroll();
        $('html, body').animate({ scrollTop: $('#edit-subject').length ? $('#edit-subject').offset().top - 100 : 0 }, 500);
    };

    public foldAllGrainWithoutScroll = function() {
        angular.forEach(this._grainList, function(grain:IGrain) {
            if (!this.isGrainFolded(grain)) {
                this.foldGrain(grain);
            }
        }, this);
    }

    public previewPerformSubjectCopy = function() {
        this._$location.path('/subject/copy/preview/perform/' + this._subject.id + '/');
    };

    public reOrder = function() {
        if (this._reOrderIterationCount < this._grainList.length) {

            angular.forEach(this._grainList, function (grainItem) {
                if (grainItem.order_by != parseFloat(grainItem.index) + 1) {
                    grainItem.order_by = parseFloat(grainItem.index) + 1;
                }
            });

            this._reOrderIterationCount += 1;
        }

        if (this._reOrderIterationCount === this._grainList.length) {
            this._reOrderIterationCount = 0;

            var self = this;

            angular.forEach(this._grainList, function (grain:IGrain) {
                if (!self.isGrainFolded(grain)) {
                    self.foldGrain(grain);
                }
                self.updateGrain(grain);
            });
        }
    };

    public foldOrganizer = function() {
        this._isOrganizerFolded = !this._isOrganizerFolded;
    };

    public scrollToGrain = (grain_id) => {
        $('html, body').animate({ scrollTop: $(`#grain-edit-${grain_id}`).offset().top - 70 }, 500);
    }

    /**
     *  TOASTER
     */

    public selectGrain = function(grain:IGrain) {
        var grainIndex = this._selectedGrainList.indexOf(grain);

        if (grainIndex !== -1) {
            this._selectedGrainList.splice(grainIndex, 1);
        } else {
            this._selectedGrainList.push(grain);
        }

        if (this._selectedGrainList.length > 1) {
            this._selectedGrainList.sort(function(grainA:IGrain, grainB:IGrain) {
                return grainA.order_by > grainB.order_by;
            });
        }
    };

    public isGrainSelected = function(grain:IGrain) {
        return this._selectedGrainList.indexOf(grain) !== -1;
    };

    public duplicateSelectedGrainList = function() {
        var self = this;

        this._grainService.duplicateIntoSubject(this._selectedGrainList, this._subject.id).then(
            function() {
                self._selectedGrainList = [];
                self._grainService.getListBySubject(self._subject).then(
                    function(grainList) {
                        self._grainList = grainList;
                        self.foldAllGrainWithoutScroll();
                        var grainIdToScroll=0;
                        _.forEach(grainList, function (grain) {
                           if (grain.id > grainIdToScroll) grainIdToScroll = grain.id;
                        });

                        self._$scope.$$postDigest(function() {
                            self.scrollToGrain(grainIdToScroll);
                        });
                    }
                );
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public removeSelectedGrainList = function() {
        var self = this;

        this._grainService.removeList(this._selectedGrainList, this._subject).then(
            function() {
                self._selectedGrainList = [];
                self._isModalRemoveSelectedGrainListDisplayed = false;
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public displayModalRemoveSelectedGrainList = function() {
        this._isModalRemoveSelectedGrainListDisplayed = true;
    };

    public closeModalRemoveSelectedGrainList = function() {
        this._isModalRemoveSelectedGrainListDisplayed = false;
    };

    public resetSelection = function() {
        this._selectedGrainList = [];
    };

    public isToasterDisplayed = function() {
        return this._selectedGrainList.length > 0;
    };

    /**
     *  GETTER
     */

    get subject():ISubject {
        return this._subject;
    }

    get grainList():IGrain[] {
        return this._grainList;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }

    get isModalAddGrainDocumentDisplayed():boolean {
        return this._isModalAddGrainDocumentDisplayed;
    }

    get isModalRemoveGrainDocumentDisplayed():boolean {
        return this._isModalRemoveGrainDocumentDisplayed;
    }

    get organizerFolded():boolean {
        return this._isOrganizerFolded;
    }

    set organizerFolded(value : boolean) {
        this._isOrganizerFolded = value;
    }

    get isModalRemoveSelectedGrainListDisplayed():boolean {
        return this._isModalRemoveSelectedGrainListDisplayed;
    }

    get isDropableZone():boolean {
        return this._isDropableZone;
    }
}

export const editSubjectController = ng.controller('EditSubjectController', EditSubjectController);