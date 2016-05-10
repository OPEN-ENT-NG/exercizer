/// <reference path="./../../../typings/angular-1.2.d.ts"/>

/**
 * bindToController -> angular 1.3/4
 */

directives.push(
    {
        name: "editSimpleAnswer",
        injections: [ 'GrainService', 'SimpleAnswerService',(GrainService, SimpleAnswerService) => {
            return {
                restrict: "E",
                scope: {
                    grain: '=',
                },
                templateUrl: 'exercizer/public/app/components/simple_answer/templates/edit.html',
                link:(scope : any, element, attrs) => {

                    function init(){
                        if(scope.grain.grain_data.custom_data == null){
                            scope.grain.grain_data.custom_data = SimpleAnswerService.createObjectCustomData();
                        }
                    }
                    init();

                    scope.actionOnBlur = function(){
                        GrainService.updateGrain(
                            scope.grain,
                            function(data){
                                //success
                            },
                            function(err){
                                console.error(err);
                            }
                        )
                    }
                }
            };
        }]
    }
);






