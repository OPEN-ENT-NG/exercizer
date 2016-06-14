directives.push(
    {
        name: 'grainEditTextHeader',
        injections: ['$rootScope', ($rootScope) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '=',
                    text: '@'
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-text-header.html',
                link: (scope:any) => {
                    scope.removeGrain = function() {
                        $rootScope.$broadcast('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN', scope.grain);
                    };
                }
            };
        }]
    }
);
