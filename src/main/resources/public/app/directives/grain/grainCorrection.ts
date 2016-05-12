directives.push(
    {
        name: "grainCorrection",
        injections: ['GrainTypeService','GrainCopyService', (GrainTypeService, GrainCopyService) => {
            return {
                restrict: "E",
                scope : {
                    grainCopy : "=",
                    state : "@"
                },
                templateUrl: 'exercizer/public/app/templates/directives/grain/grainCorrection.html',
                link:(scope : any, element, attrs) => {

                    scope.updateGrainCopy = function(){
                        console.log("TODO : save grain copy");
                    }
                }
            };
        }]
    }
);