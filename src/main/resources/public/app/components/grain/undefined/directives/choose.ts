directives.push(
    {
        name: 'choose',
        injections: ['GrainService', 'GrainTypeService', (GrainService:IGrainService, GrainTypeService:IGrainTypeService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/undefined/templates/choose.html',
                link:(scope:any) => {

                    console.log('coucou1');
                    
                    scope.displayNextStep = function(grainTypeId) {
                        scope.grain.grain_type_id = grainTypeId;
                        scope.grain.grain_data.title = GrainTypeService.getById(grainTypeId).public_name;
                        GrainService.update(scope.grain).then(
                            function() {},
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

