directives.push(
    {
        name: 'subjectEditModalRemoveGrain',
        injections: [

            (

            ) => {
                return {
                    restrict: 'E',
                    scope: {
                        subject: '='
                    },
                    templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-modal-remove-grain.html',
                    link:(scope:any) => {

                        scope.isDisplayed = false;
                        scope.grain = undefined;

                        scope.confirm = function() {
                            scope.$emit("E_CONFIRM_REMOVE_GRAIN", scope.grain);
                            scope.isDisplayed = false;
                        };

                        scope.cancel = function() {
                            scope.isDisplayed = false;
                        };

                        scope.$on("E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN", function(event, grain:IGrain) {
                            scope.grain = grain;
                            scope.isDisplayed = true;
                        });
                    }
                };
            }
        ]
    }
);
