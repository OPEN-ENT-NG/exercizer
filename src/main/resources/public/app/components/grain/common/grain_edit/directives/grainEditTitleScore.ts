directives.push(
    {
        name: 'grainEditTitleScore',
        injections: ['GrainService', 'GrainTypeService', (GrainService:IGrainService, GrainTypeService:IGrainTypeService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-title-score.html',
                link:(scope:any) => {
                    scope.updateGrain = function() {
                        scope.grain.grain_data.title = StringISOHelper.toISO(scope.grain.grain_data.title);

                        if (angular.isUndefined(scope.grain.grain_data.title)) {
                            scope.grain.grain_data.title = GrainTypeService.getById(scope.grain.grain_type_id).public_name;
                        }

                        if (angular.isUndefined(scope.grain.grain_data.max_score)) {
                            scope.grain.grain_data.max_score = 0;
                        }

                        GrainService.update(scope.grain).then(
                            function(grain:IGrain) {
                                scope.grain = grain;
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };
                }
            };
        }]

    }
);