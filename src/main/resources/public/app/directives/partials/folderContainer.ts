directives.push(
    {
        name: 'folderContainer',
        injections: ['FolderService', (FolderService) => {
            return {
                restrict: 'E',
                replace  : true,
                scope: {
                    folderList: "=",
                    isRoot: "=",
                    parentId :"=",
                    setCurrentFolderFn : "&",
                    currentFolderId : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/partials/folderContainer.html',
                link: (scope:any, element, attrs) => {

                    scope.setCurrentFolder = scope.setCurrentFolderFn();
                }
            };
        }]
    }
);
