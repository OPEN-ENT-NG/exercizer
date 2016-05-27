directives.push(
    {
        name: 'teacherDashboardSubjectList',
        injections: ['SubjectService', 'FolderService', 'DragService',
            (SubjectService, FolderService, DragService) => {
                return {
                    restrict: 'E',
                    scope: {
                        subject: '='
                    },
                    templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_list/templates/teacher-dashboard-subject-list.html',
                    link: (scope:any) => {

                        /**
                         * INIT
                         */
                        scope.displayList = 'domino';

                        /**
                         * GETTER
                         */

                        scope.subjectList = function () {
                            return SubjectService.getList();
                        };

                        scope.folderList = function () {
                            return FolderService.folderList;
                        };

                        scope.canManageFolder = function (fodler) {
                            return true;
                        };
                        scope.canManageSubject = function (subject) {
                            return true;
                        };

                        scope.getSubjectPicture = function (subject) {
                            var defaultPicture = "/assets/themes/leo/img/illustrations/poll-default.png";
                            return subject.picture || defaultPicture;
                        };

                        scope.getSubjectModificationDate = function (subject) {
                            if(subject){
                                return subject.modified ? "Modifié le " + subject.modified : ""
                            }
                        };

                        /**
                         * EVENT
                         */

                        scope.clickOnFolderTitle = function (folder) {
                            FolderService.currentFolderId = folder.id;
                        };

                        scope.clickOnSubjectTitle = function (subject) {
                            if (subject.id) {
                                this.$location.path('/teacher/subject/edit/' + subject.id);
                            }
                        };

                        scope.selectFolder = function (folder) {
                            folder.selected = folder.selected ? true : false;
                            // TODO
                            //this.selectionService.toggleFolder(folder.id, folder.selected);
                        };
                        scope.selectSubject = function (subject) {
                            subject.selected = subject.selected ? true : false;
                            // TODO
                            // this.selectionService.toggleSubject(subject.id, subject.selected);
                        };

                        scope.clickCreateFolder = function () {
                            // this.lightboxService.showLightboxEditFolderForNewFolder();
                        };

                        scope.goToRoot = function () {
                            FolderService.currentFolderId = null;
                        };

                        /**
                         * FILTER
                         */

                        scope.filterFolderByParentFolder = function (folder) {
                            if (FolderService.currentFolderId) {
                                return folder.parent_folder_id == FolderService.currentFolderId
                            }
                            return folder.parent_folder_id == null;
                        };
                        scope.filterSubjectByParentFolder = function (subject) {
                            if (FolderService.currentFolderId) {
                                return subject.folder_id == FolderService.currentFolderId
                            }
                            return subject.folder_id == null;
                        };

                        /**
                         * DRAG
                         */

                        scope.drag = function (item, $originalEvent) {
                            DragService.drag(item, $originalEvent);
                        };

                        scope.dragFolderCondition = function (item) {
                            return DragService.canDragFolderInPage(item);
                        };
                        scope.dragSubjectCondition = function (item) {
                            return DragService.canDragSubjectInPage(item);
                        };

                        scope.dropTo = function (targetItem, $originalEvent) {
                            DragService.dropTo(targetItem, $originalEvent, scope);
                        };

                        scope.dropFolderCondition = function (targetItem) {
                            return DragService.canDropOnFolderInPage(targetItem);

                        };
                        scope.dropSubjectCondition = function (targetItem) {
                            return DragService.canDropOnSubjectInPage(targetItem);
                        };

                        scope.dropToRoot = function ($originalEvent) {
                            DragService.dropTo(null, $originalEvent, scope);
                        };

                    }
                };
            }]
    }
);
