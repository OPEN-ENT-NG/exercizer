directives.push(
    {
        name: 'editSimpleAnswer',
        injections:
            [
                'E_UPDATE_GRAIN',
                'E_TOGGLE_GRAIN',
                'E_FORCE_FOLDING_GRAIN',
                (
                    E_UPDATE_GRAIN,
                    E_TOGGLE_GRAIN,
                    E_FORCE_FOLDING_GRAIN
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            grain: '='
                        },
                        templateUrl: 'exercizer/public/app/components/grain/simple_answer/templates/edit-simple-answer.html',
                        link:(scope:any) => {

                            if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                                scope.grain.grain_data.custom_data = new SimpleAnswerCustomData();
                            }

                            scope.isFolded = false;

                            scope.$on(E_TOGGLE_GRAIN + scope.grain.subject_id, function(event, grain:IGrain) {
                                if (grain.id === scope.grain.id) {
                                    scope.isFolded = !scope.isFolded;
                                }
                            });

                            scope.$on(E_FORCE_FOLDING_GRAIN + scope.grain.subject_id, function() {
                                scope.isFolded = true;
                            });
                        }
                    };
                }
            ]
    }
);






