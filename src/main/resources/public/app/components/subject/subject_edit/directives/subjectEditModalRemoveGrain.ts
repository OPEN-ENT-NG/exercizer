directives.push(
    {
        name: 'subjectEditModalRemoveGrain',
        injections: ['GrainService', (GrainService:IGrainService) => {
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
                        GrainService.remove(scope.grain).then(
                            function() {
                                scope.isDisplayed = false;
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };

                    scope.cancel = function() {
                        scope.isDisplayed = false;
                    };

                    scope.$on('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN', function(event, grain:IGrain) {
                        scope.grain = grain;
                        scope.isDisplayed = true;
                    });
                }
            };
        }]
    }
);
