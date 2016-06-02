directives.push(
    {
        name: 'chooseAnswer',
        injections:
            [
                'GrainTypeService',
                (
                    GrainTypeService
                ) => {
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
                                scope.$emit("E_UPDATE_GRAIN", scope.grain);
                            }
                        }
                    };
                }
            ]
    }
);

