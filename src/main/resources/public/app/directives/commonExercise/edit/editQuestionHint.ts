/**
 * Created by Erwan_LP on 29/04/2016.
 */
/// <reference path="./../../../typings/angular-1.2.d.ts"/>
var editQuestionHint = [ () => {
    return {
        restrict: "E",
        scope : {
            hintModel : "=",
            onBlurFunction : "&"
        },
        templateUrl: 'exercizer/public/app/templates/directives/commonExercise/edit/editQuestionHint.html',
        link:(scope : any, element, attrs) => {
        }
    };
}];