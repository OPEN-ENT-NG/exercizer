directives.push(
    {
        name: 'grainEditAnswerExplanation',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-answer-explanation.html',
                link:(scope:any) => {
                    scope.updateGrain = function() {
                        scope.grain.grain_data.answer_explanation = StringISOHelper.toISO(scope.grain.grain_data.answer_explanation);
                    }
                }
            };
        }]
    }
);
