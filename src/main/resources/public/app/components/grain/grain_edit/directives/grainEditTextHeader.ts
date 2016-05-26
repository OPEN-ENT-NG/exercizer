directives.push(
    {
        name: 'grainEditTextHeader',
        injections: [ 
            'E_REMOVE_GRAIN',
            (
                E_REMOVE_GRAIN
            ) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '=',
                    text: '@'
                },
                templateUrl: 'exercizer/public/app/components/grain/grain_edit/templates/grain-edit-text-header.html',
                link: (scope:any) => {
                    scope.removeGrain = function() {
                        scope.$emit(E_REMOVE_GRAIN + scope.grain.subject_id, scope.grain);
                    };
                }
            };
        }]
    }
);
