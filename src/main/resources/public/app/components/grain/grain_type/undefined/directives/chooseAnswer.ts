directives.push(
    {
        name: 'chooseAnswer',
        injections:
            [
                'GrainTypeService',
                'E_UPDATE_GRAIN',
                (
                    GrainTypeService,
                    E_UPDATE_GRAIN
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            grain: '='
                        },
                        templateUrl: 'exercizer/public/app/components/grain/grain_type/undefined/templates/choose-answer.html',
                        link:(scope:any) => {
                            
                            scope.grainTypeList = GrainTypeService.getList();
                            
                            scope.displayNextStep = function(grainTypeId) {
                                scope.grain.grain_type_id = grainTypeId;
                                scope.$emit(E_UPDATE_GRAIN + scope.grain.subject_id, scope.grain);
                            }
                        }
                    };
                }
            ]
    }
);

