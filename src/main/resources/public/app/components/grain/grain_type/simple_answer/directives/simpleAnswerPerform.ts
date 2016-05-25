directives.push(
    {
        name: "simpleAnswerPerform",
        injections: [ 'GrainCopyService', 'SimpleAnswerService','GrainScheduledService', (GrainCopyService, SimpleAnswerService, GrainScheduledService) => {
            return {
                restrict: "E",
                scope: {
                    grainCopy: '=',
                    grainState : '@'
                },
                templateUrl: 'exercizer/public/app/components/grain/grain_type/simple_answer/templates/simpleAnswerPerform.html',
                link:(scope : any, element, attrs) => {

                    function  init(){
                        if(scope.grainCopy.grain_copy_data.custom_copy_data == null){
                            scope.grainCopy.grain_copy_data.custom_copy_data = SimpleAnswerService.createObjectCustomCopyData();
                        }
                    }
                    init();
                }
            };
        }]
    }
);







