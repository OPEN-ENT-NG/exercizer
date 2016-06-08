directives.push(
    {
        name: 'folderNavItem',
        injections: ['FolderService', 'DragService', '$compile', (FolderService, DragService, $compile) => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    item: "=",
                    isRoot: "=",
                    parentId : "=",
                    setCurrentFolderFn : "&",
                    currentFolderId : "="
                },
                templateUrl: 'exercizer/public/app/components/folder/common/folder_nav/templates/folder-nav-item.html',
                link: (scope:any, element, attrs) => {

                    scope.folderList = FolderService.folderList;
                    scope.display = {
                        children : false
                    };

                    scope.setCurrentFolder = scope.setCurrentFolderFn();

                    scope.$watch('folderList', function () {
                        // set subjectFolderList
                        scope.subFolderList = FolderService.getListOfSubFolderByFolderId(scope.item.id);
                        // delete directive
                        var directiveDOM = element[0].getElementsByClassName('append');
                        if(directiveDOM.length !=0){
                            directiveDOM[0].remove();
                        }
                        // is folder list empty ?
                        scope.countChildren = 0;
                        angular.forEach(scope.subFolderList, function (value, key) {
                            scope.countChildren++
                        });
                        if (scope.countChildren != 0) {
                            // if not empty
                            if(scope.isItemDisplayed()){
                                // if displayed item
                                element.children()
                                    .after($compile("<folder-nav-container class=append is-root='false' parent-id = 'item.id' folder-list='subFolderList' set-current-folder-fn='setCurrentFolder' current-folder-id = 'currentFolderId' display='display'></folder-nav-container>")(scope))
                            }
                        }
                    }, true);

                    /**
                     * EVENT
                     */

                    scope.clickOnFolder = function (folder) {
                            scope.setCurrentFolder(folder);
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

                    /**
                     * DISPLAY
                     */

                    scope.isItemDisplayed = function () {
                        if (scope.isRoot == true) {
                            //root folder
                            return scope.item.parent_folder_id == null;

                        } else {
                            // sub folder
                            return scope.item.parent_folder_id == scope.parentId;
                        }
                    };

                    scope.isCurrentFolder = function(item){
                        if(item.id == scope.currentFolderId){
                            return 'selected';
                        }
                    }

                }
            };
        }]
    }
);
