directives.push(
    {
        name: 'folderNavContainer',
        injections: [() => {
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
                templateUrl: 'exercizer/public/app/components/folder/common/folder_nav/templates/folder-nav-container.html',
                link: (scope:any, element, attrs) => {

                    scope.setCurrentFolder = scope.setCurrentFolderFn();
                }
            };
        }]
    }
);
