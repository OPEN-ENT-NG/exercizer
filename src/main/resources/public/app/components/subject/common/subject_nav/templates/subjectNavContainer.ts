directives.push(
    {
        name: 'subjectNavContainer',
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
                templateUrl: 'exercizer/public/app/components/subject/common/subject_nav/directives/subject-nav-container.html',
                link: (scope:any, element, attrs) => {

                }
            };
        }]
    }
);
