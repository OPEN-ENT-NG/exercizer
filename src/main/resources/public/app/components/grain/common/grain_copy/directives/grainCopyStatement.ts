directives.push(
    {
        name: 'grainCopyStatement',
        injections: ['$sce', ($sce) => {
            return {
                restrict: 'E',
                scope : {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_copy/templates/grain-copy-statement.html',
                link:(scope:any) => {
                }
            };
        }]
    }
);
