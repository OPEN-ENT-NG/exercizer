directives.push(
    {
        name: 'folderItem',
        injections: ['FolderService','DragService', (FolderService, DragService) => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    item: "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/partials/folderItem.html',
                link: (scope:any, element, attrs) => {


                    /**
                     * EVENT
                     */

                    scope.clickOnFolder = function (folder) {
                        FolderService.currentFolderId = folder.id;
                    };

                    /**
                     * DRAG
                     */

                    scope.drag = function (item, $originalEvent) {
                        DragService.drag(item, $originalEvent);
                    };

                    scope.dragCondition = function (item) {
                        return DragService.canDragFolderInNav(item);
                    };

                    scope.dropTo = function (targetItem, $originalEvent) {
                        DragService.dropTo(targetItem, $originalEvent, scope);
                    };

                    scope.dropCondition = function (targetItem) {
                        return DragService.canDropOnFolderInNav(targetItem);
                    };

                }
            };
        }]
    }
);
