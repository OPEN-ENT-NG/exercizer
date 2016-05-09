/// <reference path="./../../../typings/angular-1.2.d.ts"/>

directives.push(
    {
        name: "performQuestionHint",
        injections: [() => {
            return {
                restrict: "E",
                scope: {
                    hint: '=',
                },
                templateUrl: 'exercizer/public/app/templates/directives/commonExercise/perform/performQuestionHint.html',
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);



