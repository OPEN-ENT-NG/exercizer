import { ng } from 'entcore';

export const folderNavContainer = ng.directive('folderNavContainer',
    [() => {
        return {
            restrict: 'E',
            replace  : true,
            scope: {
                folderList: "=",
                isRoot: "=",
                parentId :"=",
                setCurrentFolderFn : "&",
                currentFolderId : "=",
                display : "="
            },
            templateUrl: 'exercizer/public/ts/app/components/folder/common/folder_nav/templates/folder-nav-container.html',
            link: (scope:any, element, attrs) => {

                scope.setCurrentFolder = scope.setCurrentFolderFn();
            }
        };
    }]
);
