directives.push(
    {
        name: 'grainEditFooter',
        injections: ['GrainService', (GrainService:IGrainService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-footer.html',
                link:(scope:any) => {
                    scope.updateGrain = function() {
                        scope.grain.grain_data.answer_explanation = StringISOHelper.toISO(scope.grain.grain_data.answer_explanation);
                        scope.grain.grain_data.answer_hint = StringISOHelper.toISO(scope.grain.grain_data.answer_hint);

                        GrainService.update(scope.grain).then(
                            function(grain:IGrain) {
                                scope.grain = grain;
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    }
                }
            };
        }]
    }
);