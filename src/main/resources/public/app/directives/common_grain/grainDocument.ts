/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainDocument",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    documentList : '=',
                },
                templateUrl: "exercizer/public/app/templates/directives/common_grain/grainDocument.html",
                link:(scope : any, element, attrs) => {
                }
            };
        }]
    }
);