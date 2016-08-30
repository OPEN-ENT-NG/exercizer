directives.push(
    {
        name: 'viewFillText',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainScheduled: '=',
                    grainCopy: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/filltext/templates/view.html',
                link: (scope: any) => {
                    var result = zonegrain.automaticCorrection(scope.grainScheduled, scope.grainCopy);
                    scope.correction = result.answers_result.correction;
                    scope.customData = scope.grainCopy.grain_copy_data.custom_copy_data;
                    if (!scope.grainCopy.calculated_score) {
                        scope.grainCopy.calculated_score = result.calculated_score;
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







