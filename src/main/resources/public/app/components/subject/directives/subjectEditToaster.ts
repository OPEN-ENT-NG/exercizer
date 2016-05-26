directives.push(
    {
        name: 'subjectEditToaster',
        injections:
            [
                'E_DUPLICATE_SELECTED_GRAIN_LIST',
                'E_REMOVE_SELECTED_GRAIN_LIST',
                'E_TOGGLE_SUBJECT_EDIT_TOASTER',

                (
                    E_DUPLICATE_SELECTED_GRAIN_LIST,
                    E_REMOVE_SELECTED_GRAIN_LIST,
                    E_TOGGLE_SUBJECT_EDIT_TOASTER
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/templates/subject-edit-toaster.html',
                        link:(scope:any) => {

                            scope.isDisplayed = false;

                            scope.duplicateSelectedGrainList = function() {
                                scope.$emit(E_DUPLICATE_SELECTED_GRAIN_LIST + scope.subject.id);
                            };

                            scope.removeSelectedGrainList = function() {
                                scope.$emit(E_REMOVE_SELECTED_GRAIN_LIST + scope.subject.id);
                            };
                            
                            scope.$on(E_TOGGLE_SUBJECT_EDIT_TOASTER + scope.subject.id, function(event, selectedGrainListCount) {
                                scope.isDisplayed = selectedGrainListCount !== 0;
                            });
                        }
                    };
                }
            ]
    }
);


