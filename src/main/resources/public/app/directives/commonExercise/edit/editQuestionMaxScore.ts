/// <reference path="./../../../typings/angular-1.2.d.ts"/>
var editQuestionMaxScore = [ () => {
    return {
        restrict: "E",
        scope : {
            maxScoreModel : "=",
            onBlurFunction : "&"
        },
        templateUrl: 'exercizer/public/app/templates/directives/commonExercise/edit/editQuestionMaxScore.html',
        link:(scope : any, element, attrs) => {
        }
    };
}];


