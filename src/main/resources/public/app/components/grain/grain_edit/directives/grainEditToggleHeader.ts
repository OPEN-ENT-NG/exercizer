directives.push(
    {
        name: 'grainEditToggleHeader',
        injections:
            [
                'GrainTypeService',
                'E_REMOVE_GRAIN',
                'E_GRAIN_TOGGLED',
                'E_TOGGLE_GRAIN',
                'E_FORCE_FOLDING_GRAIN',
                (
                    GrainTypeService,
                    E_REMOVE_GRAIN,
                    E_GRAIN_TOGGLED,
                    E_TOGGLE_GRAIN,
                    E_FORCE_FOLDING_GRAIN
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            grain: '='
                        },
                        templateUrl: 'exercizer/public/app/components/grain/grain_edit/templates/grain-edit-toggle-header.html',
                        link:(scope:any) => {

                            scope.grainType = GrainTypeService.getById(scope.grain.grain_type_id);
                            scope.isFolded = false;

                            scope.toggleGrain = function() {
                                scope.$emit(E_GRAIN_TOGGLED + scope.grain.subject_id, scope.grain);
                            };

                            scope.removeGrain = function() {
                                scope.$emit(E_REMOVE_GRAIN + scope.grain.subject_id, scope.grain);
                            };

                            scope.getGrainIllustrationURL = function(grainIllustration:string) {
                                return '/exercizer/public/assets/illustrations/' + grainIllustration + '.html';
                            };
                            
                            scope.$on(E_TOGGLE_GRAIN + scope.grain.subject_id, function(event, grain) {
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
