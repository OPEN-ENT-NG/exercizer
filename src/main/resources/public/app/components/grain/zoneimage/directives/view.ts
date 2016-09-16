directives.push(
    {
        name: 'viewZoneImage',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainScheduled: '=',
                    grainCopy: '=',
                    grainCopyList: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/zoneimage/templates/view.html',
                link: (scope: any) => {
                    scope.grainCopy.grain_copy_data.custom_copy_data = new zonetext.CustomData(scope.grainCopy.grain_copy_data.custom_copy_data);

                    var result = zonegrain.automaticCorrection(scope.grainScheduled, scope.grainCopy);
                    scope.correction = result.answers_result.correction;
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







