class EditSubjectController {

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
    private _isModalRemoveGrainDisplayed:boolean;
    private _isModalAddGrainDocumentDisplayed:boolean;
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
        private _$sce,
        private _$scope:ng.IScope,
        private _$location:ng.ILocationService,
        private _subjectService:ISubjectService,
        private _subjectScheduledService:ISubjectScheduledService,
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
        this._isModalAddGrainDocumentDisplayed = false;
        this._isModalRemoveGrainDocumentDisplayed = false;
        this._currentGrainForAction = undefined;
        this._currentGrainDocumentToRemove = undefined;

        // organizer
        this._isOrganizerFolded = false;
        this._reOrderIterationCount = 0;

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

    public scheduleSubject() {
        this._$scope.$broadcast('E_DISPLAY_MODAL_SCHEDULE_SUBJECT', this._subject);
    }
    
    public getGrainDisplayedName = function(grain) {
        var displayedName = '';
        
        if (grain.grain_type_id > 3) {

            grain.grain_data.title = StringISOHelper.toISO(grain.grain_data.title);
            displayedName = angular.isUndefined(grain.grain_data.title) ? this.getGrainPublicName(grain.grain_type_id) : grain.grain_data.title;
            
        } else {
            displayedName = this.getGrainPublicName(grain.grain_type_id);
        }
        
        return displayedName;
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

    public dropTo = function($originalEvent) {
        var dataField = this._dragService.dropConditionFunction(this._subject, $originalEvent),
            originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField)),
            self = this;

        this._grainService.duplicate(originalItem, this._subject).then(
            function(grainDuplicated) {
                self._$scope.$$postDigest(function() {
                    jQuery('html, body').animate({ scrollTop: jQuery('#grain-edit-' + grainDuplicated.id).offset().top - 100}, 500);
                });

            },
            function(err) {
                notify.error(err);
            }
        )
    };

    private _updateSubject(updateMaxScore:boolean = false) {
        var self = this;

        this._subjectService.update(this._subject, updateMaxScore).then(
            function(subject:ISubject) {
                self._subject = subject;
            },
            function(err) {
                notify.error(err);
            }
        );
    };

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
                self._updateSubject();
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
            grain.grain_data.max_score = angular.isUndefined(grain.grain_data.max_score) ? 0 : parseFloat(grain.grain_data.max_score as any);
            
        } else if (grain.grain_type_id === 3) {

            if (angular.isUndefined(this._trustedHtmlStatementMap[grain.id]) && grain.grain_data.custom_data) {
                this._trustedHtmlStatementMap[grain.id] = this._$sce.trustAsHtml(grain.grain_data.custom_data.statement);
            } else{
                this._trustedHtmlStatementMap[grain.id] = this._$sce.trustAsHtml("")
            }
            //this._trustedHtmlStatementMap[grain.id] = this._$sce.trustAsHtml(grain.grain_data.custom_data.statement);
        }

        this._grainService.update(grain).then(
            function() {
                self._updateSubject(grain.grain_type_id > 3)
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public removeGrain = function() {
        var self = this,
            grainIndexInSelection = this._selectedGrainList.indexOf(this._currentGrainForAction),
            grainIndexInFoldedList = this._foldedGrainList.indexOf(this._currentGrainForAction);


        if (grainIndexInSelection !== -1) {
            this._selectedGrainList.splice(grainIndexInSelection, 1);
        }

        if (grainIndexInFoldedList !== -1) {
            this._foldedGrainList.splice(grainIndexInFoldedList, 1);
        }

        this._grainService.remove(this._currentGrainForAction).then(
            function() {
                self._updateSubject(self._currentGrainForAction.grain_type_id > 3);
                self._currentGrainForAction = undefined;
                self._isModalRemoveGrainDisplayed = false;
            },
            function(err) {
                notify.error(err);
            }
        );
    };

    public displayModalRemoveGrain = function(grain:IGrain) {
        this._currentGrainForAction = grain;
        this._isModalRemoveGrainDisplayed = true;
    };

    public closeModalRemoveGrain = function() {
        this._currentGrainForAction = undefined;
        this._isModalRemoveGrainDisplayed = false;
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
        var grainIndexInSelection = this._selectedGrainList.indexOf(grain),
            grainIndexInFoldedList = this._foldedGrainList.indexOf(grain);

        if (grainIndexInSelection !== -1 && grainIndexInFoldedList === -1) {
            this._selectedGrainList.splice(grainIndexInSelection, 1);

            if (this._selectedGrainList.length > 1) {
                this._selectedGrainList.sort(function(grainA:IGrain, grainB:IGrain) {
                    return grainA.order_by > grainB.order_by;
                });
            }
        }

        if (grainIndexInFoldedList !== -1) {
            this._foldedGrainList.splice(grainIndexInFoldedList, 1);
        } else {
            this._foldedGrainList.push(grain);
        }
    };

    public isGrainFolded = function(grain:IGrain) {
        return this._foldedGrainList.indexOf(grain) !== -1;
    };

    /**
     * ORGANIZER
     */

    public foldAllGrain = function() {
        angular.forEach(this._grainList, function(grain:IGrain) {
            if (!this.isGrainFolded(grain)) {
                this.foldGrain(grain);
            }
        }, this);
    };

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

        this._grainService.duplicateList(this._selectedGrainList, this._subject).then(
            function() {
                self._selectedGrainList = [];
                self.foldAllGrain();
                self._updateSubject(true);
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
                self._updateSubject(true);
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

    get isModalRemoveGrainDisplayed():boolean {
        return this._isModalRemoveGrainDisplayed;
    }

    get isModalAddGrainDocumentDisplayed():boolean {
        return this._isModalAddGrainDocumentDisplayed;
    }

    get isModalRemoveGrainDocumentDisplayed():boolean {
        return this._isModalRemoveGrainDocumentDisplayed;
    }

    get isOrganizerFolded():boolean {
        return this._isOrganizerFolded;
    }

    get isModalRemoveSelectedGrainListDisplayed():boolean {
        return this._isModalRemoveSelectedGrainListDisplayed;
    }
}

