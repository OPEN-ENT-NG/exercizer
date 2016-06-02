directives.push(
    {
        name: 'subjectEditToaster',
        injections:
            [


                (

                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-toaster.html',
                        link:(scope:any) => {

                            scope.isDisplayed = false;

                            scope.duplicateSelectedGrainList = function() {
                                scope.$emit("E_DUPLICATE_SELECTED_GRAIN_LIST");
                            };

                            scope.removeSelectedGrainList = function() {
                                scope.$emit("E_REMOVE_SELECTED_GRAIN_LIST");
                            };
                            
                            scope.$on("E_TOGGLE_SUBJECT_EDIT_TOASTER", function(event, selectedGrainListCount) {
                                scope.isDisplayed = selectedGrainListCount !== 0;
                            });
                        }
                    };
                }
            ]
    }
);


