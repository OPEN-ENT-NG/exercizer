directives.push(
    {
        name: 'subjectEditModalRemoveGrain',
        injections: [
            'E_CONFIRM_REMOVE_GRAIN',
            'E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN',
            (
                E_CONFIRM_REMOVE_GRAIN,
                E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN
            ) => {
                return {
                    restrict: 'E',
                    scope: {
                        subject: '='
                    },
                    templateUrl: 'exercizer/public/app/components/subject/templates/subject-edit-modal-remove-grain.html',
                    link:(scope:any) => {

                        scope.isDisplayed = false;
                        scope.grain = undefined;

                        scope.confirm = function() {
                            scope.$emit(E_CONFIRM_REMOVE_GRAIN + scope.subject.id, scope.grain);
                            scope.isDisplayed = false;
                        };

                        scope.cancel = function() {
                            scope.isDisplayed = false;
                        };

                        scope.$on(E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN + scope.subject.id, function(event, grain:IGrain) {
                            scope.grain = grain;
                            scope.isDisplayed = true;
                        });
                    }
                };
            }
        ]
    }
);
