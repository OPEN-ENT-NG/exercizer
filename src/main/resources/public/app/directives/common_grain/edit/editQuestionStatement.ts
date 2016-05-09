/// <reference path="./../../../typings/angular-1.2.d.ts"/>
var editQuestionStatement = [ () => {
    return {
        restrict: "E",
        scope : {
            statementModel : "=",
            onBlurFunction : "&"
        },
        templateUrl: 'exercizer/public/app/templates/directives/commonExercise/edit/editQuestionStatement.html',
        link:(scope : any, element, attrs) => {
        }
    };
}];
