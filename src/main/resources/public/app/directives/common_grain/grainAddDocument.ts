/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainAddDocument",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    state: '@',
                },
                templateUrl: "exercizer/public/app/templates/directives/common_grain/grainAddDocument.html",
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);