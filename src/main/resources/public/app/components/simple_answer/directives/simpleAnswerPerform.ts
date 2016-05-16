/**
 * Created by Erwan_LP on 28/04/2016.
 */
/// <reference path="./../../../typings/angular-1.2.d.ts"/>

/**
 * bindToController -> angular 1.3/4
 */

directives.push(
    {
        name: "simpleAnswerPerform",
        injections: [ 'GrainCopyService', 'SimpleAnswerService','GrainScheduledService', (GrainCopyService, SimpleAnswerService, GrainScheduledService) => {
            return {
                restrict: "E",
                scope: {
                    grainCopy: '=',
                    state : '@'
                },
                templateUrl: 'exercizer/public/app/components/simple_answer/templates/simpleAnswerPerform.html',
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

/*
 // autocorrection here to test
 SimpleAnswerService.resolver(scope.grainCopy, grain_scheduled);
 */






