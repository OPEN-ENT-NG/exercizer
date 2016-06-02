directives.push(
    {
        name: 'subjectEditModalRemoveSelectedGrainList',
        injections: [
            (
            ) => {
                return {
                    restrict: 'E',
                    scope: {
                        subject: '='
                    },
                    templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-modal-remove-selected-grain-list.html',
                    link:(scope:any) => {

                        scope.isDisplayed = false;

                        scope.confirm = function() {
                            scope.$emit("E_CONFIRM_REMOVE_SELECTED_GRAIN_LIST");
                            scope.isDisplayed = false;
                        };
                        
                        scope.cancel = function() {
                            scope.isDisplayed = false;
                        };

                        scope.$on("E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_SELECTED_GRAIN_LIST", function() {
                            scope.isDisplayed = true;
                        });
                    }
                };
            }
        ]
    }
);
