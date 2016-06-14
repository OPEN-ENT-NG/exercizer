directives.push(
    {
        name: 'choose',
        injections: ['GrainService', (GrainService:IGrainService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/undefined/templates/choose.html',
                link:(scope:any) => {
                    scope.displayNextStep = function(grainTypeId) {
                        scope.grain.grain_type_id = grainTypeId;
                        GrainService.update(scope.grain).then(
                            function(grain:IGrain) {
                                scope.grain = grain;
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    }
                }
            };
        }]
    }
);

