directives.push(
    {
        name: 'choose',
        injections: [ 
            (
            ) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/undefined/templates/choose.html',
                link:(scope:any) => {
                    scope.displayNextStep = function(grainTypeId) {
                        
                        scope.grain.grain_type_id = grainTypeId;
                        
                        scope.$emit("E_UPDATE_GRAIN", scope.grain);
                    }
                }
            };
        }]
    }
);

