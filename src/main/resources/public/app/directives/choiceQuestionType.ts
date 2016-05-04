/**
 * Created by Erwan_LP on 29/04/2016.
 */
directives.push(
    {
        name: "choiceQuestionType",
        injections: ["QuestionTypeService","GrainCreationService", (QuestionTypeService, GrainCreationService) => {
            return {
                restrict: "E",
                scope: {
                    item: '=item'
                },
                templateUrl: 'exercizer/public/app/templates/directives/choiceQuestionType.html',
                link: (scope:any, element, attrs) => {

                    scope.questionTypeList = function () {
                        return QuestionTypeService.questionTypeList;
                    };

                    scope.choiceQuestionType = function(type){
                        GrainCreationService.choiceQuestionType(scope.item,type);
                    }
                }
            };
        }]
    }
);