directives.push(
    {
        name: 'grainEditToggleHeader',
        injections: ['GrainTypeService', (GrainTypeService:IGrainTypeService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '=',
                    isFolded: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-toggle-header.html',
                link:(scope:any) => {

                    scope.grainType = GrainTypeService.getById(scope.grain.grain_type_id);

                    scope.toggleGrain = function() {
                        scope.isFolded = !scope.isFolded;
                    };

                    scope.getGrainIllustrationURL = function(grainIllustration:string) {
                        return '/exercizer/public/assets/illustrations/' + grainIllustration + '.html';
                    };

                    scope.removeGrain = function() {
                        scope.$emit('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN', scope.grain);
                    };

                    scope.$on('E_FORCE_FOLDING_GRAIN', function() {
                        scope.isFolded = true;
                    });
                }
            };
        }]
    }
);
