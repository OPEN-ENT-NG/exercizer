directives.push(
    {
        name: 'grainEditAnswerHint',
        injections:
            [() => {
                return {
                    restrict: 'E',
                    scope: {
                        grain: '='
                    },
                    templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-answer-hint.html',
                    link:(scope:any) => {
                        scope.updateGrain = function() {
                            scope.grain.grain_data.answer_hint = StringISOHelper.toISO(scope.grain.grain_data.answer_hint);
                            scope.$emit('E_UPDATE_GRAIN', scope.grain);
                        }
                    }
                };
            }]
    }
);