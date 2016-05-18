/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainHint",
        injections: [() => {
            return {
                restrict: "E",
                scope: {
                    hint: '=',
                    grainState: '@',
                    onBlurFunction: "&"
                },
                templateUrl: "exercizer/public/app/templates/directives/common_grain/grainHint.html",
                link: (scope:any, element, attrs) => {

                    scope.displayHintPerform = false;

                    scope.toggleDisplayHintPerform = function () {
                        scope.displayHintPerform = !scope.displayHintPerform;
                    }

                }
            };
        }]
    }
);