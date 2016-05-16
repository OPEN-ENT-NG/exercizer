directives.push(
    {
        name: "grainAutoCorrection",
        injections: [ 'GrainTypeService' , (GrainTypeService) => {
            return {
                restrict: "E",
                scope : {
                    grainCopy : "=",
                    grainScheduled : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/grain/grainAutoCorrection.html',
                link:(scope : any, element, attrs) => {

                    var currentTypeName = GrainTypeService.getTypeNameByTypeId(scope.grainCopy.grain_type_id);

                    scope.getTypeNameByCurrentGrain = function(){
                        return currentTypeName;
                    };
                }
            };
        }]
    }
);