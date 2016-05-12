directives.push(
    {
        name: "grainPerform",
        injections: ['GrainTypeService','GrainCopyService', (GrainTypeService, GrainCopyService) => {
            return {
                restrict: "E",
                scope : {
                    grainCopy : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/grain/GrainPerform.html',
                link:(scope : any, element, attrs) => {

                    var currentTypeName;

                    function init(){
                        currentTypeName = GrainTypeService.getTypeNameByTypeId(scope.grainCopy.grain_type_id);
                    }
                    init();

                    scope.getTypeDirectiveEditNameByCurrentGrainCopy = function(){
                        return currentTypeName;
                    };
                }
            };
        }]
    }
);