directives.push(
    {
        name: 'subjectEditModalGrainDocument',
        injections:
            [
                'E_CONFIRM_ADD_GRAIN_DOCUMENT',
                'E_DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT',
                (
                    E_CONFIRM_ADD_GRAIN_DOCUMENT,
                    E_DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-modal-grain-document.html',
                        link:(scope:any) => {

                            scope.isDisplayed = false;
                            scope.grain = undefined;
                            scope.mediaLibraryItem = undefined;

                            scope.addGrainDocument = function() {
                                var grainDocument = new GrainDocument();

                                grainDocument.id = scope.mediaLibraryItem._id;
                                grainDocument.owner = scope.mediaLibraryItem.owner;
                                grainDocument.ownerName = scope.mediaLibraryItem.ownerName;
                                grainDocument.created = scope.mediaLibraryItem.created._i;
                                grainDocument.title = scope.mediaLibraryItem.title;
                                grainDocument.name = scope.mediaLibraryItem.name;
                                grainDocument.path = '/workspace/document/' + grainDocument.id;

                                if (angular.isUndefined(scope.grain.grain_data)) {
                                    scope.grain.grain_data = new GrainData();
                                }

                                if (angular.isUndefined(scope.grain.grain_data.document_list)) {
                                    scope.grain.grain_data.document_list = [];
                                }

                                scope.grain.grain.grain_data.document_list.push(grainDocument);

                                scope.$emit(E_CONFIRM_ADD_GRAIN_DOCUMENT + scope.subject.id, scope.grain);
                                scope.isDisplayed = false;
                            };

                            scope.close = function() {
                                scope.isDisplayed = false;
                            };

                            scope.$on(E_DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT + scope.subject.id, function(event, grain:IGrain) {
                                scope.grain = grain;
                                scope.isDisplayed = true;
                            });
                        }
                    };
                }
            ]
    }
);