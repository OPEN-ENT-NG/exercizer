directives.push(
    {
        name: 'grainEditHeader',
        injections: ['GrainTypeService', 'GrainService', 'SubjectService', 'SubjectEditService', (GrainTypeService:IGrainTypeService, GrainService:IGrainService, SubjectService:ISubjectService, SubjectEditService:ISubjectEditService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '=',
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-header.html',
                link:(scope:any, element:any) => {
                    
                    /**
                     * Common part
                     */
                    
                    if (angular.isUndefined(scope.grain.grain_data.max_score)) {
                        scope.grain.grain_data.max_score = 0;
                    }
                    
                    function _updateGrain(updateSubject:boolean = false) {
                        GrainService.update(scope.grain).then(
                            function(grain:IGrain) {
                                scope.grain = grain;
                                if (updateSubject) {
                                    var subject = SubjectService.getById(scope.grain.subject_id);
                                    
                                    SubjectService.update(subject, true).then(
                                        function () {}, 
                                        function(err) {
                                            notify.error(err);
                                        }
                                    );
                                }
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    }

                    /**
                     * Header part
                     */
                    
                    var isModalRemoveGrainDisplayed = false;
                    scope.grainTypePublicName = GrainTypeService.getPublicName(scope.grain.grain_type_id);
                    scope.grainTypeIconName = GrainTypeService.getIllustrationIconName(scope.grain.grain_type_id);
                    scope.grainTypeIllustrationUrl = GrainTypeService.getIllustrationUrl(scope.grain.grain_type_id);

                    scope.foldGrain = function() {
                        SubjectEditService.foldGrain(scope.grain);
                    };
                    
                    scope.isGrainFolded = function() {
                        return SubjectEditService.isGrainFolded(scope.grain);
                    };

                    scope.displayModalRemoveGrain = function() {
                        isModalRemoveGrainDisplayed = true;
                    };
                    
                    scope.isModalRemoveGrainDisplayed = function() {
                        return isModalRemoveGrainDisplayed;
                    };
                    
                    scope.closeModalRemoveGrain = function() {
                        isModalRemoveGrainDisplayed = false;
                    };
                    
                    scope.removeGrain = function() {
                        if (SubjectEditService.isGrainSelected(scope.grain)) {
                            SubjectEditService.selectGrain(scope.grain);
                        }
                        
                        GrainService.remove(scope.grain).then(
                            function() {
                                isModalRemoveGrainDisplayed = false;
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };

                    /**
                     * Title & score part
                     */

                    scope.updateGrainTitle = function() {
                        scope.grain.grain_data.title = StringISOHelper.toISO(scope.grain.grain_data.title);

                        if (angular.isUndefined(scope.grain.grain_data.title)) {
                            scope.grain.grain_data.title = scope.grainTypePublicName;
                        }

                        _updateGrain();
                    };

                    scope.updateGrainScore = function() {
                        if (angular.isUndefined(scope.grain.grain_data.max_score) || !scope.grain.grain_data.max_score) {
                            scope.grain.grain_data.max_score = 0;
                        } else {
                            scope.grain.grain_data.max_score = parseFloat(scope.grain.grain_data.max_score);
                        }

                        _updateGrain(true);
                    };

                    /**
                     * Statement part
                     */

                    var isEditorFocus = false;

                    // event JQuery because no ng-blur on editor
                    element.find('editor').on('editor-focus', function(){
                        isEditorFocus = true;
                    });

                    // event JQuery because no ng-blur on editor
                    element.find('editor').on('editor-blur', function(){
                        if (isEditorFocus) {
                            isEditorFocus = false;
                            scope.grain.grain_data.statement = StringISOHelper.toISO(scope.grain.grain_data.statement);

                            _updateGrain();
                        }
                    });

                    /**
                     * Grain document list part
                     */

                    var isModalAddGrainDocumentDisplayed = false,
                        isModalRemoveGrainDocumentDisplayed = false,
                        currentGrainDocumentToRemove = undefined;

                    scope.displayModalAddGrainDocument = function() {
                        isModalAddGrainDocumentDisplayed = true;
                    };

                    scope.isModalAddGrainDocumentDisplayed = function() {
                        return isModalAddGrainDocumentDisplayed;
                    };

                    scope.closeModalAddGrainDocument = function() {
                        isModalAddGrainDocumentDisplayed = false;
                    };

                    scope.addGrainDocument = function(mediaLibraryItem:any) {
                        var grainDocument = new GrainDocument();

                        grainDocument.id = mediaLibraryItem._id;
                        grainDocument.owner = mediaLibraryItem.owner;
                        grainDocument.ownerName = mediaLibraryItem.ownerName;
                        grainDocument.created = mediaLibraryItem.created ? mediaLibraryItem.created.toISOString() : null;
                        grainDocument.title = mediaLibraryItem.title;
                        grainDocument.name = mediaLibraryItem.name;
                        grainDocument.path = '/workspace/document/' + grainDocument.id;

                        if (angular.isUndefined(scope.grain.grain_data.document_list)) {
                            scope.grain.grain_data.document_list = [];
                        }

                        scope.grain.grain_data.document_list.push(grainDocument);
                        isModalAddGrainDocumentDisplayed = false;
                        
                        _updateGrain();
                    };

                    scope.displayModalRemoveGrainDocument = function(grainDocument:IGrainDocument) {
                        currentGrainDocumentToRemove = grainDocument;
                        isModalRemoveGrainDocumentDisplayed = true;
                    };

                    scope.isModalRemoveGrainDocumentDisplayed = function() {
                        return isModalRemoveGrainDocumentDisplayed;
                    };

                    scope.closeModalRemoveGrainDocument = function() {
                        isModalRemoveGrainDocumentDisplayed = false;
                    };

                    scope.removeGrainDocument = function() {
                        var grainDocumentIndex = scope.grain.grain_data.document_list.indexOf(currentGrainDocumentToRemove);

                        if (grainDocumentIndex !== -1) {
                            scope.grain.grain_data.document_list.splice(grainDocumentIndex, 1);
                            _updateGrain();
                        }

                        currentGrainDocumentToRemove = undefined;
                        isModalRemoveGrainDocumentDisplayed = false;
                    };
                }
            };
        }]
    }
);
