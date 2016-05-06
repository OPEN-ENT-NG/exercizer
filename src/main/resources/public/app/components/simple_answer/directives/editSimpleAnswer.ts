/**
 * Created by Erwan_LP on 28/04/2016.
 */
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
                        if(scope.grain){
                            var grain_data : IGrainData =  GrainService.createObjectGrainData();
                            scope.grain.grain_data = grain_data;
                            var custom_data : ISimpleAnswerCustomData = SimpleAnswerService.createObjectCustomData();
                            scope.grain.grain_data.custom_data = custom_data;
                        } else{
                            throw "Grain not found";
                        }
                    }
                    init();

                    scope.actionOnBlur = function(){
                        GrainService.updateGrain(
                            scope.grain,
                            function(data){
                                //success
                                console.info('Grain updated', data);
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






