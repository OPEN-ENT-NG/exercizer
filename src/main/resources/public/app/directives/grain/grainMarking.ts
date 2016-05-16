directives.push(
    {
        name: "grainMarking",
        injections: ['GrainTypeService','GrainCopyService', (GrainTypeService, GrainCopyService) => {
            return {
                restrict: "E",
                scope : {
                    grainCopy : "=",
                    grainState : "@",
                    grainScheduled : '='
                },
                templateUrl: 'exercizer/public/app/templates/directives/grain/grainMarking.html',
                link:(scope : any, element, attrs) => {

                    scope.updateGrainCopy = function(){
                        console.log("TODO : save grain copy");
                    };

                }
            };
        }]
    }
);