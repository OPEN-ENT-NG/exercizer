directives.push(
    {
        name: "grainPerform",
        injections: ['GrainTypeService','GrainCopyService', (GrainTypeService, GrainCopyService) => {
            return {
                restrict: "E",
                scope : {
                    grainCopy : "=",
                    grainState : "@"
                },
                templateUrl: 'exercizer/public/app/templates/directives/grain/grainPerform.html',
                link:(scope : any, element, attrs) => {

                    console.log('grainPerform state : '+scope.grainState);

                    var currentTypeName;

                    function init(){
                        currentTypeName = GrainTypeService.getTypeNameByTypeId(scope.grainCopy.grain_type_id);
                    }
                    init();

                    scope.getTypeNameByCurrentGrain = function(){
                        return currentTypeName;
                    };
                }
            };
        }]
    }
);