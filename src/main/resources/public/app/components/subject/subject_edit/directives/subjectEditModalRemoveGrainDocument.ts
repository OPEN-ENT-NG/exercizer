directives.push(
    {
        name: 'subjectEditModalRemoveGrainDocument',
        injections:
            [
                'E_CONFIRM_REMOVE_GRAIN_DOCUMENT',
                'E_DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT',
                (
                    E_CONFIRM_REMOVE_GRAIN_DOCUMENT,
                    E_DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-modal-remove-grain-document.html',
                        link:(scope:any) => {

                            scope.isDisplayed = false;
                            scope.grain = undefined;
                            scope.grainDocument = undefined;

                            scope.confirm = function() {

                                if (!angular.isUndefined(scope.grain.grain_data) && !angular.isUndefined(scope.grain.grain_data.document_list)) {

                                    var grainDocumentIndex = scope.grain.grain_data.document_list.indexOf(scope.grainDocument);

                                    if (grainDocumentIndex !== -1) {
                                        scope.grain.grain_data.document_list.splice(grainDocumentIndex, 1);
                                        scope.$emit(E_CONFIRM_REMOVE_GRAIN_DOCUMENT + scope.subject.id, scope.grain);
                                    }
                                }

                                scope.isDisplayed = false;
                            };

                            scope.cancel = function() {
                                scope.isDisplayed = false;
                            };

                            scope.$on(E_DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT + scope.subject.id, function(event, grain:IGrain, grainDocument:IGrainDocument) {
                                scope.grain = grain;
                                scope.grainDocument = grainDocument;
                                scope.isDisplayed = true;
                            });
                        }
                    };
                }
            ]
    }
);
