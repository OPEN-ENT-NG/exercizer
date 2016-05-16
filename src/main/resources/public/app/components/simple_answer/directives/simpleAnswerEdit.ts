/// <reference path="./../../../typings/angular-1.2.d.ts"/>

/**
 * bindToController -> angular 1.3/4
 */

directives.push(
    {
        name: "simpleAnswerEdit",
        injections: [ 'GrainService', 'SimpleAnswerService',(GrainService, SimpleAnswerService) => {
            return {
                restrict: "E",
                scope: {
                    grain: '=',
                    updateGrain : "&"
                },
                templateUrl: 'exercizer/public/app/components/simple_answer/templates/simpleAnswerEdit.html',
                link:(scope : any, element, attrs) => {

                    function init(){
                        // If the custom data doesn't exit, create it
                        if(scope.grain.grain_data.custom_data == null){
                            scope.grain.grain_data.custom_data = SimpleAnswerService.createObjectCustomData();
                        }
                    }
                    init();
                }
            };
        }]
    }
);






