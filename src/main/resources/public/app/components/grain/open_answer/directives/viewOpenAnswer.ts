directives.push(
    {
        name: 'viewOpenAnswer',
        injections: ['$sce', 'OpenAnswerService', ($sce, OpenAnswerService) => {
            return {
                restrict: 'E',
                scope: {
                    grainScheduled: '=',
                    grainCopy: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/open_answer/templates/view-open-answer.html',
                link:(scope:any) => {

                    if (angular.isUndefined(scope.grainCopy.calculated_score)) {
                        var result = OpenAnswerService.automaticCorrection(scope.grainScheduled, scope.grainCopy);
                        scope.grainCopy.calculated_score = result.calculated_score;
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }

                    scope.openAnswerHtml = $sce.trustAsHtml(scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer);

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







