directives.push(
    {
        name: 'grainEditAnswerHint',
        injections:
            [
                (
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            grain: '='
                        },
                        templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-answer-hint.html',
                        link:(scope:any) => {
                            scope.updateGrain = function() {
                                scope.$emit("E_UPDATE_GRAIN", scope.grain);
                            }
                        }
                    };
                }
            ]
    }
);