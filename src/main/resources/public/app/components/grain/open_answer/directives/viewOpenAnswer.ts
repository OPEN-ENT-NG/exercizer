directives.push(
    {
        name: 'viewOpenAnswer',
        injections: ['$sce', ($sce) => {
            return {
                restrict: 'E',
                scope: {
                    grainScheduled: '=',
                    grainCopy: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/open_answer/templates/view-open-answer.html',
                link:(scope:any) => {

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







