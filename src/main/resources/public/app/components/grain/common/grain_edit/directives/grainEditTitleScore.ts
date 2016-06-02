directives.push(
    {
        name: 'grainEditTitleScore',
        injections:
            [
                (
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            grain: '='
                        },
                        templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-title-score.html',
                        link:(scope:any) => {
                            scope.updateGrain = function() {
                                scope.$emit("E_UPDATE_GRAIN", scope.grain);
                            };
                        }
                    };
                }
            ]
    }
);