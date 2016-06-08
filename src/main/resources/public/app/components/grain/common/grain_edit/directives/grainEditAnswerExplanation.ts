directives.push(
    {
        name: 'grainEditAnswerExplanation',
        injections:
            [() => {
                return {
                    restrict: 'E',
                    scope: {
                        grain: '='
                    },
                    templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-answer-explanation.html',
                    link:(scope:any) => {
                        scope.updateGrain = function() {
                            scope.grain.grain_data.answer_explanation = StringISOHelper.toISO(scope.grain.grain_data.answer_explanation);
                            scope.grain.grain_data.max_score = StringISOHelper.toISO(scope.grain.grain_data.max_score);
                            
                            if (angular.isUndefined(scope.grain.grain_data.max_score)) {
                                scope.grain.grain_data.max_score = 0;
                            }
                            
                            scope.$emit('E_UPDATE_GRAIN', scope.grain);
                        }
                    }
                };
            }]
    }
);
