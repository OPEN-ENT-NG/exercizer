directives.push(
    {
        name: 'subjectEditModalRemoveSelectedGrainList',
        injections: [
            'E_CONFIRM_REMOVE_SELECTED_GRAIN_LIST',
            'E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_SELECTED_GRAIN_LIST',
            (
                E_CONFIRM_REMOVE_SELECTED_GRAIN_LIST,
                E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_SELECTED_GRAIN_LIST
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
                            scope.$emit(E_CONFIRM_REMOVE_SELECTED_GRAIN_LIST + scope.subject.id);
                            scope.isDisplayed = false;
                        };
                        
                        scope.cancel = function() {
                            scope.isDisplayed = false;
                        };

                        scope.$on(E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_SELECTED_GRAIN_LIST + scope.subject.id, function() {
                            scope.isDisplayed = true;
                        });
                    }
                };
            }
        ]
    }
);
