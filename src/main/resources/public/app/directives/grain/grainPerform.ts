directives.push(
    {
        name: "grainPerform",
        injections: ['GrainTypeService','GrainCopyService', (GrainTypeService, GrainCopyService) => {
            return {
                restrict: "E",
                scope : {
                  grain : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/grain/GrainPerform.html',
                link:(scope : any, element, attrs) => {

                    var typeDirectiveCurrentName;

                    function init(){
                        typeDirectiveCurrentName = GrainTypeService.getTypeDirectiveEditNameByGrainId(scope.grain.grain_type_id);
                    }
                    init();

                    scope.getTypeDirectiveEditNameByCurrentGrain = function(){
                        return typeDirectiveCurrentName;
                    };
                }
            };
        }]
    }
);