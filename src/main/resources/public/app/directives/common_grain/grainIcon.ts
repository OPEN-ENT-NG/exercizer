/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainIcon",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    typeName: '=',
                },
                templateUrl: 'exercizer/public/app/templates/directives/common_grain/grainIcon.html',
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);