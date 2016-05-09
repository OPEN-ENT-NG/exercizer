/**
 * Created by Erwan_LP on 28/04/2016.
 */
/// <reference path="./../../../typings/angular-1.2.d.ts"/>

/**
 * bindToController -> angular 1.3/4
 */

directives.push(
    {
        name: "performSimpleAnswer",
        injections: [ 'GrainCopyService', 'SimpleAnswerService','GrainScheduledService', (GrainCopyService, SimpleAnswerService, GrainScheduledService) => {
            return {
                restrict: "E",
                scope: {
                    grain: '=',
                },
                templateUrl: 'exercizer/public/app/components/simple_answer/templates/perform.html',
                link:(scope : any, element, attrs) => {

                    function  init(){
                        scope.grainCopy = GrainCopyService.createObjectGrainCopyFromGrain(scope.grain);
                        scope.grainCopy.grain_copy_data.custom_copy_data = SimpleAnswerService.createObjectCustomCopyData();
                    }
                    init();

                    scope.clickNextQuestion = function(){
                        // autocorrection here to test
                        var grain_scheduled = GrainScheduledService.createObjectGrainScheduledFromGrain(scope.grain);
                        SimpleAnswerService.automaticCorrection(scope.grainCopy, grain_scheduled);

                    };



                    /**
                     * TEMP
                     * @type {IGrainCopy}
                     */
                    scope.$watch('grain', function() {
                        //keep custom_copy_data
                        var custom_copy_data : ISimpleAnswerCustomCopyData = scope.grainCopy.grain_copy_data.custom_copy_data;
                        scope.grainCopy = GrainCopyService.createObjectGrainCopyFromGrain(scope.grain);
                        scope.grainCopy.grain_copy_data.custom_copy_data = custom_copy_data;
                    }, true);

                }
            };
        }]
    }
);






