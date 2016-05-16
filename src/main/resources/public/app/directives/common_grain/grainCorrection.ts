/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainCorrection",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    correction: '=',
                    grainState: '@',
                    onBlurFunction : "&"
                },
                templateUrl: "exercizer/public/app/templates/directives/common_grain/grainCorrection.html",
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);