directives.push(
    {
        name: 'statementPerform',
        injections: 
            [ 
            '$sce',
                (
                    $sce
                ) => {
            return {
                restrict: 'E',
                scope : {
                    grainCopy : '='
                },
                templateUrl: 'exercizer/public/app/components/grain/grain_type/statement/templates/perform-statement.html',
                link:(scope : any) => {
                    scope.statementHtml = $sce.trustAsHtml(scope.grainCopy.grain_copy_data.custom_copy_data.statement);
                }
            };
        }]
    }
);

