directives.push(
    {
        name: 'folderItem',
        injections: ['FolderService', (FolderService) => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    item: "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/partials/folderItem.html',
                link: (scope:any, element, attrs) => {


                    /**
                     * COMPUTATION
                     */

                    function moveFolderAToFolderB(folderA, folderB) {
                        FolderService.modifyFolderAParentIdByFolderBId(folderA.id, folderB.id);
                        scope.$apply();
                    }

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
                        try {
                            $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
                        } catch (e) {
                            $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
                        }
                    };

                    scope.dragCondition = function (item) {
                        return true;
                    };

                    scope.dropTo = function (targetItem, $originalEvent) {
                        var dataField = dropConditionFunction(targetItem, $originalEvent);
                        var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));

                        moveFolderAToFolderB(originalItem, targetItem);
                    };

                    scope.dropCondition = function (targetItem) {
                        return true;
                    };

                    function dropConditionFunction(targetItem, event) {
                        var dataField = event.dataTransfer.types.indexOf && event.dataTransfer.types.indexOf("application/json") > -1 ? "application/json" : //Chrome & Safari
                            event.dataTransfer.types.contains && event.dataTransfer.types.contains("application/json") ? "application/json" : //Firefox
                                event.dataTransfer.types.contains && event.dataTransfer.types.contains("Text") ? "Text" : //IE
                                    undefined;

                        return dataField ? dataField : false;
                    }

                }
            };
        }]
    }
);
