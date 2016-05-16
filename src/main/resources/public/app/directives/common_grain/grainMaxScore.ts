/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainMaxScore",
        injections: [ 'SubjectService', (SubjectService) => {
            return {
                restrict: "E",
                scope: {
                    maxScore: '=',
                    grainState: '@',
                    onBlurFunction : "&"
                },
                templateUrl: "exercizer/public/app/templates/directives/common_grain/grainMaxScore.html",
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