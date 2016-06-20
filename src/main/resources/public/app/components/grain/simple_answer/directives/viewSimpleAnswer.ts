directives.push(
    {
        name: 'viewSimpleAnswer',
        injections: ['SimpleAnswerService', (SimpleAnswerService) => {
            return {
                restrict: 'E',
                scope: {
                    grainScheduled: '=',
                    grainCopy: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/simple_answer/templates/view-simple-answer.html',
                link: (scope:any) => {

                    if (angular.isUndefined(scope.grainCopy.calculated_score) || scope.grainCopy.calculated_score === null) {
                        var result = SimpleAnswerService.automaticCorrection(scope.grainScheduled, scope.grainCopy);
                        scope.grainCopy.calculated_score = result.calculated_score;
                        scope.isCorrect = result.answers_result.filled_answer;
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }

                    scope.updateGrainCopy = function () {
                        if (scope.isTeacher) {
                            scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                        }
                    };
                }
            };
        }]
    }
);







