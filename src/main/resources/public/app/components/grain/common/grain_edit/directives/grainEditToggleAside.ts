directives.push(
    {
        name: 'grainEditToggleAside',
        injections: ['$rootScope', ($rootScope) => {
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
                        scope.isGrainSelected = !scope.isGrainSelected;
                        $rootScope.$broadcast('E_GRAIN_TOGGLED', scope.grain);
                    };
                    
                    scope.$on('E_GRAIN_DESELECT_ALL', function() {
                        scope.isGrainSelected = false;
                    })
                }
            };
        }]
    }
);
