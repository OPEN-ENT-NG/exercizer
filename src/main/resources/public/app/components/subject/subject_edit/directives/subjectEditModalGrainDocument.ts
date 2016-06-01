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
                        link:(scope : any, element, attr) => {

                            scope.isDisplayed = false;
                            scope.grain = undefined;

                            scope.addGrainDocument = function(mediaLibraryItem) {
                                var grainDocument = new GrainDocument();

                                grainDocument.id = mediaLibraryItem._id;
                                grainDocument.owner = mediaLibraryItem.owner;
                                grainDocument.ownerName = mediaLibraryItem.ownerName;
                                grainDocument.created = mediaLibraryItem.created ? mediaLibraryItem.created.toISOString() :null;
                                grainDocument.title = mediaLibraryItem.title;
                                grainDocument.name = mediaLibraryItem.name;
                                grainDocument.path = '/workspace/document/' + grainDocument.id;


                                if (angular.isUndefined(scope.grain.grain_data)) {
                                    throw "Grain has no grain data";
                                }

                                if (angular.isUndefined(scope.grain.grain_data.document_list)) {
                                    scope.grain.grain_data.document_list = [];
                                }

                                scope.grain.grain_data.document_list.push(grainDocument);

                                scope.$emit(E_CONFIRM_ADD_GRAIN_DOCUMENT + scope.subject.id, scope.grain);
                                scope.close();
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