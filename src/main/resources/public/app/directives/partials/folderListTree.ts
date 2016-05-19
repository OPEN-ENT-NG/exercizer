directives.push(
    {
        name: 'folderListTree',
        injections: ['FolderService', (FolderService) => {
            return {
                restrict: 'E',
                scope: {
                    folderList: "=",
                },
                templateUrl: 'exercizer/public/app/templates/directives/partials/folderListTree.html',
                link: (scope:any, element, attrs) => {

                }
            };
        }]
    }
);
