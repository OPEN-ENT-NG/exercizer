directives.push(
    {
        name: 'editSimpleAnswer',
        injections: ['GrainService', 'SubjectEditService', (GrainService:IGrainService, SubjectEditService:ISubjectEditService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/simple_answer/templates/edit-simple-answer.html',
                link:(scope:any) => {

                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        scope.grain.grain_data.custom_data = new SimpleAnswerCustomData();
                    }

                    scope.isGrainFolded = function() {
                        return SubjectEditService.isGrainFolded(scope.grain);
                    };
                    
                    scope.updateGrain = function() {
                        GrainService.update(scope.grain).then(
                            function(grain:IGrain) {
                                scope.grain = grain;
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };
                }
            };
        }
        ]
    }
);






