directives.push(
    {
        name: 'viewMultipleAnswer',
        injections: ['MultipleAnswerService', (MultipleAnswerService) => {
            return {
                restrict: 'E',
                scope: {
                    grainScheduled: '=',
                    grainCopy: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/multiple_answer/templates/view-multiple-answer.html',
                link:(scope:any) => {

                    if (angular.isUndefined(scope.grainCopy.grain_copy_data.custom_copy_data)) {
                       throw "not possible";
                    }

                    if (angular.isUndefined(scope.grainCopy.grain_copy_data.calculated_score)) {
                        var result = MultipleAnswerService.automaticCorrection(scope.grainScheduled, scope.grainCopy);
                        scope.grainCopy.calculated_score = result.calculated_score;
                        scope.isCorrect = result.answers_result;
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }

                    scope.updateGrainCopy = function() {
                        if (scope.isTeacher) {
                            scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                        }
                    };
                }
            };
        }]
    }
);







