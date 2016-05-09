/// <reference path="./../../../typings/angular-1.2.d.ts"/>

directives.push(
    {
        name: "performQuestionTitle",
        injections: [() => {
            return {
                restrict: "E",
                scope: {
                    title: '=',
                },
                templateUrl: 'exercizer/public/app/templates/directives/commonExercise/perform/performQuestionTitle.html',
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);



