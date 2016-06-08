directives.push(
    {
        name: 'performStatement',
        injections: ['$sce', ($sce) => {
            return {
                restrict: 'E',
                scope : {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/statement/templates/perform-statement.html',
                link:(scope:any) => {
                    if (angular.isUndefined(scope.grainCopy.grain_copy_data.custom_copy_data.statement)) {
                        scope.statementHtml = '';
                    } else {
                        scope.statementHtml = $sce.trustAsHtml(scope.grainCopy.grain_copy_data.custom_copy_data.statement);
                    }
                }
            };
        }]
    }
);

