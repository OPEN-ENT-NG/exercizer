directives.push(
    {
        name: "listItem",
        injections: ['FolderService', 'DragService','$location', (FolderService, DragService, $location) => {
            return {
                restrict: "A",
                scope: {
                    folder: "=",
                    subject: "=",
                    type: "@"

                },
                templateUrl: 'exercizer/public/app/templates/directives/listItem.html',
                link: (scope:any, element, attrs) => {


                    /**
                     * TYPE
                     * type can be fodler or subject
                     */

                    scope.isSubject = function () {
                        return scope.type == 'subject'
                    };

                    scope.isFolder = function () {
                        return scope.type == 'folder'
                    };

                    /**
                     * GETTER
                     */

                    scope.getTitle = function () {
                        if (scope.isFolder()) {
                            return scope.folder.label;
                        } else if (scope.isSubject()) {
                            return scope.subject.title;
                        }
                    };

                    scope.canManage = function () {
                        if (scope.isFolder()) {
                            return true;
                        } else if (scope.isSubject()) {
                            return true;
                        }
                    };

                    scope.getItem = function(){
                        if (scope.isFolder()) {
                            return scope.folder;
                        } else if (scope.isSubject()) {
                            return scope.subject;
                        }
                    };

                    /**
                     * EVENT
                     */

                    scope.clickOnTitle = function () {
                        if (scope.isFolder()) {
                            FolderService.currentFolderId = scope.folder.id;
                        } else if (scope.isSubject()) {
                            if (scope.subject.id) {
                                $location.path('/teacher/subject/edit/' + scope.subject.id);
                            }
                        }
                    };


                    /**
                     * FILTER
                     */

                    scope.filterParentFolder = function () {
                        if (scope.isFolder()) {
                            if (FolderService.currentFolderId) {
                                return scope.folder.parent_folder_id == FolderService.currentFolderId;
                            } else {
                                return scope.folder.parent_folder_id == null;
                            }
                        } else if (scope.isSubject()) {
                            if (FolderService.currentFolderId) {
                                return scope.subject.folder_id == FolderService.currentFolderId;
                            } else {
                                return scope.subject.folder_id == null;
                            }
                        }
                    };

                    /**
                     * DRAG
                     */

                    scope.drag = function (item, $originalEvent) {
                        DragService.drag(item, $originalEvent);
                    };

                    scope.dragCondition = function (item) {
                        if (scope.isFolder()) {
                            return DragService.canDragFolderInPage(item);
                        } else if (scope.isSubject()) {
                            return DragService.canDragSubjectInPage(item);
                        }
                    };

                    scope.dropTo = function (targetItem, $originalEvent) {
                        DragService.dropTo(targetItem, $originalEvent, scope);
                    };

                    scope.dropCondition = function (targetItem) {
                        if (scope.isFolder()) {
                            return DragService.canDropOnFolderInPage(targetItem);
                        } else if (scope.isSubject()) {
                            return DragService.canDropOnSubjectInPage(targetItem);
                        } else{
                            console.error('type not defined');
                        }
                    };

                }
            };
        }]
    }
);