/// <reference path="./../../../typings/angular-1.2.d.ts"/>
var editQuestionMaxScore = ['SubjectService', (SubjectService) => {
    return {
        restrict: "E",
        scope : {
            maxScoreModel : "=",
            onBlurFunction : "&",
        },
        templateUrl: 'exercizer/public/app/templates/directives/commonExercise/edit/editQuestionMaxScore.html',
        link:(scope : any, element, attrs) => {


            scope.onBlurLocalFunction = function(){
                console.log('onBlurLocalFunction');
                scope.onBlurFunction();
                computeSubjectMaxScore();
            };


            function computeSubjectMaxScore(){
                console.log('computeSubjectMaxScore');
                SubjectService.computeMaxScoreForCurrentSubject();
            }
        }
    };
}];


