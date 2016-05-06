/**
 * Created by Erwan_LP on 29/04/2016.
 */
/// <reference path="./../../../typings/angular-1.2.d.ts"/>
var editQuestionCorrection = [ () => {
    return {
        restrict: "E",
        scope : {
            correctionModel : "=",
            onBlurFunction : "&"
        },
        templateUrl: 'exercizer/public/app/templates/directives/commonExercise/edit/editQuestionCorrection.html',
        link:(scope : any, element, attrs) => {
        }
    };
}];