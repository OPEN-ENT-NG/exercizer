directives.push(
    {
        name: 'grainEditTextHeader',
        injections: ['SubjectEditService', 'GrainService', (SubjectEditService:ISubjectEditService, GrainService:IGrainService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '=',
                    text: '@'
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-text-header.html',
                link: (scope:any) => {

                    var isModalRemoveGrainDisplayed = false;

                    scope.displayModalRemoveGrain = function() {
                        isModalRemoveGrainDisplayed = true;
                    };

                    scope.isModalRemoveGrainDisplayed = function() {
                        return isModalRemoveGrainDisplayed;
                    };

                    scope.closeModalRemoveGrain = function() {
                        isModalRemoveGrainDisplayed = false;
                    };

                    scope.removeGrain = function() {
                        if (SubjectEditService.isGrainSelected(scope.grain)) {
                            SubjectEditService.selectGrain(scope.grain);
                        }

                        GrainService.remove(scope.grain).then(
                            function() {
                                isModalRemoveGrainDisplayed = false;
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };
                }
            };
        }]
    }
);
