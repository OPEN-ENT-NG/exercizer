/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainTitle",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    title: '=',
                    grainState: '@',
                    onBlurFunction : "&"
                },
                templateUrl: "exercizer/public/app/templates/directives/common_grain/grainTitle.html",
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);