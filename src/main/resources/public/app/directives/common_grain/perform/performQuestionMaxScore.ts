/// <reference path="./../../../typings/angular-1.2.d.ts"/>

directives.push(
    {
        name: "performQuestionMaxScore",
        injections: [() => {
            return {
                restrict: "E",
                scope: {
                    maxScore: '=',
                },
                templateUrl: 'exercizer/public/app/templates/directives/commonExercise/perform/performQuestionMaxScore.html',
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);



