directives.push(
    {
        name: "dominoFolder",
        injections: ['FolderService','DragService', (FolderService, DragService) => {
            return {
                restrict: "E",
                scope : {
                    folder :"="
                },
                templateUrl: 'exercizer/public/app/templates/directives/dominoFolder.html',
                link:(scope : any, element, attrs) => {

                    scope.getFolderTitle =  function(){
                        return scope.folder.label;
                    };

                    scope.canManageFolder = function(){
                        return true;
                    };

                    scope.clickOnFolderTitle = function(){
                        FolderService.currentFolderId = scope.folder.id;
                    };

                    scope.filterFolder = function(){
                        if(FolderService.currentFolderId){
                            return scope.folder.parent_folder_id == FolderService.currentFolderId;
                        } else{
                            return scope.folder.parent_folder_id == null;
                        }
                    };


                    /**
                     * DRAG
                     */

                    scope.drag = function (item, $originalEvent) {
                        DragService.drag(item, $originalEvent);
                    };

                    scope.dragCondition = function (item) {
                        return DragService.canDragFolderInPage(item);
                    };

                    scope.dropTo = function (targetItem, $originalEvent) {
                        DragService.dropTo(targetItem, $originalEvent, scope);
                    };

                    scope.dropCondition = function (targetItem) {
                        return DragService.canDropOnFolderInPage(targetItem);
                    };

                 }
            };
        }]
    }
);