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

                    scope.grainTypeList = GrainTypeService.getList();

                    scope.getGrainIllustrationURL = function(grainIllustration:string) {
                        return '/exercizer/public/assets/illustrations/' + grainIllustration + '.html';
                    };

                    scope.displayNextStep = function(grainTypeId:number) {
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
        }
        ]
    }
);

