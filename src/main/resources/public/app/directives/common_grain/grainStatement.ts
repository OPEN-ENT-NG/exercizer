/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainStatement",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    statement: '=',
                    grainState: '@',
                    onBlurFunction : "&"
                },
                templateUrl: "exercizer/public/app/templates/directives/common_grain/grainStatement.html",
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);