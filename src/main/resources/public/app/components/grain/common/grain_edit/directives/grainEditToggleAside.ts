directives.push(
    {
        name: 'grainEditToggleAside',
        injections: [
            'E_GRAIN_SELECTED',
            'E_SELECT_GRAIN',
            (
                E_GRAIN_SELECTED,
                E_SELECT_GRAIN
            ) => {
                return {
                    restrict: 'E',
                    scope: {
                        grain: '=',
                        cellCount: '@'
                    },
                    templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-toggle-aside.html',
                    link: (scope:any) => {
                        scope.isGrainSelected = false;

                        scope.toggleGrainSelection = function() {
                            scope.$emit(E_GRAIN_SELECTED + scope.grain.subject_id, scope.grain);
                        };

                        scope.$on(E_SELECT_GRAIN + scope.grain.subject_id, function(event, grain:IGrain) {
                            if (grain.id === scope.grain.id) {
                                scope.isGrainSelected = !scope.isGrainSelected;
                            }
                        });
                    }
                };
            }]
    }
);
