directives.push(
    {
        name: 'editOpenAnswer',
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
                        templateUrl: 'exercizer/public/app/components/grain/open_answer/templates/edit-open-answer.html',
                        link:(scope:any) => {

                            scope.isFolded = false;

                            scope.updateGrain = function() {
                                scope.$emit(E_UPDATE_GRAIN + scope.grain.subject_id, scope.grain);
                            };

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






