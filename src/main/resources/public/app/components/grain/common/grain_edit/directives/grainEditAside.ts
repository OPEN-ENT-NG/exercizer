directives.push(
    {
        name: 'grainEditAside',
        injections: ['SubjectEditService', (SubjectEditService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '=',
                    cellCount: '@'
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-aside.html',
                link: (scope:any) => {
                    
                    scope.isGrainSelected = function() {
                        return SubjectEditService.isGrainSelected(scope.grain);
                    };
                    
                    scope.selectGrain = function() {
                        SubjectEditService.selectGrain(scope.grain);
                    }
                    
                }
            };
        }]
    }
);
