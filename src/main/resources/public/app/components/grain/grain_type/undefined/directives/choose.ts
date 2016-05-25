directives.push(
    {
        name: 'choose',
        injections: [ 
            'E_UPDATE_GRAIN',
            (
                E_UPDATE_GRAIN
            ) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/grain_type/undefined/templates/choose.html',
                link:(scope:any) => {
                    scope.displayNextStep = function(grainTypeId) {
                        
                        scope.grain.grain_type_id = grainTypeId;
                        
                        scope.$emit(E_UPDATE_GRAIN + scope.grain.subject_id, scope.grain);
                    }
                }
            };
        }]
    }
);

