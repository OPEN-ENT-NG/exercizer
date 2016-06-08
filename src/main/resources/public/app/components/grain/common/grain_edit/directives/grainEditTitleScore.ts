directives.push(
    {
        name: 'grainEditTitleScore',
        injections:
            [() => {
                return {
                    restrict: 'E',
                    scope: {
                        grain: '='
                    },
                    templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-title-score.html',
                    link:(scope:any) => {
                        scope.updateGrain = function() {
                            scope.grain.grain_data.title = StringISOHelper.toISO(scope.grain.grain_data.title);
                            scope.$emit('E_UPDATE_GRAIN', scope.grain);
                        };
                    }
                };
            }]
    }
);