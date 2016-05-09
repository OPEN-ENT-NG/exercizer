/// <reference path="./../../../typings/angular-1.2.d.ts"/>

directives.push(
    {
        name: "performQuestionStatement",
        injections: [() => {
            return {
                restrict: "E",
                scope: {
                    statement: '=',
                },
                templateUrl: 'exercizer/public/app/templates/directives/commonExercise/perform/performQuestionStatement.html',
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);



