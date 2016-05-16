/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainMaxScore",
        injections: [ 'SubjectService', (SubjectService) => {
            return {
                restrict: "E",
                scope: {
                    maxScore: '=',
                    state: '@',
                    onBlurFunction : "&"
                },
                templateUrl: function($elem, $attr){
                    if($attr.state != 'edit'){
                        throw "state not valid"
                    }
                    return "exercizer/public/app/templates/directives/common_grain/"+$attr.state+"/maxScore.html";
                },
                link:(scope : any, element, attrs) => {


                    scope.onBlurLocalFunction = function(){
                        scope.onBlurFunction();
                        computeSubjectMaxScore();
                    };

                    function computeSubjectMaxScore(){
                        SubjectService.computeMaxScoreForCurrentSubject();
                    }

                }
            };
        }]
    }
);