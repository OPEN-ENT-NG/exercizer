directives.push(
    {
        name: 'chooseAnswer',
        injections: ['GrainService', 'GrainTypeService', (GrainService:IGrainService, GrainTypeService:IGrainTypeService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/undefined/templates/choose-answer.html',
                link:(scope:any) => {

                    console.log('coucou2');

                    scope.grainTypeList = GrainTypeService.getList();

                    scope.getGrainIllustrationURL = function(grainIllustration:string) {
                        return '/exercizer/public/assets/illustrations/' + grainIllustration + '.html';
                    };

                    scope.displayNextStep = function(grainTypeId:number) {
                        scope.grain.grain_type_id = grainTypeId;
                        scope.grain.grain_data.title = '';
                        GrainService.update(scope.grain).then(
                            function() {},
                            function(err) {
                                notify.error(err);
                            }
                        );
                    }
                }
            };
        }
        ]
    }
);

