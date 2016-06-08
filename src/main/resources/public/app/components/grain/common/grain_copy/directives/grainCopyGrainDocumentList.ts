directives.push(
    {
        name: 'grainCopyGrainDocumentList',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_copy/templates/grain-copy-grain-document-list.html'
            };
        }]
    }
);