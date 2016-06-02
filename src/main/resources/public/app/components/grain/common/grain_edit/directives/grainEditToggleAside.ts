directives.push(
    {
        name: 'grainEditToggleAside',
        injections: [
            (
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
                            scope.$emit("E_GRAIN_SELECTED", scope.grain);
                        };

                        scope.$on("E_SELECT_GRAIN", function(event, grain:IGrain) {
                            if (grain.id === scope.grain.id) {
                                scope.isGrainSelected = !scope.isGrainSelected;
                            }
                        });
                    }
                };
            }]
    }
);
