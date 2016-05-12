directives.push(
    {
        name: "grainPerform",
        injections: ['GrainTypeService','GrainCopyService', (GrainTypeService, GrainCopyService) => {
            return {
                restrict: "E",
                scope : {
                    grainCopy : "=",
                    state : "@"
                },
                templateUrl: 'exercizer/public/app/templates/directives/grain/grainPerform.html',
                link:(scope : any, element, attrs) => {

                    console.log('stateGrainPerform : '+scope.state);


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