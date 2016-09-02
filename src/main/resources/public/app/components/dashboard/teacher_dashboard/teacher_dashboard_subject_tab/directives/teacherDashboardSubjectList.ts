directives.push(
    {
        name: 'teacherDashboardSubjectList',
        injections: ['SubjectService', 'FolderService', 'DragService', '$location','AccessService',
            (SubjectService, FolderService, DragService, $location, AccessService) => {
                return {
                    restrict: 'E',
                    scope: {
                        subject: '='
                    },
                    templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-subject-list.html',
                    link: (scope:any) => {

                        /**
                         * INIT
                         */
                        scope.displayList = 'domino';
                        scope.currentFolderId = null;
                        scope.autocomplete = {
                            subjectList: null
                        };
                        scope.data = {};

                        scope.$on('E_RESET_SELECT_ALL', function (event) {
                          scope.data.selectAll = false;
                        });


                        /**
                         * AUTOCOMPLETE
                         */

                        scope.clickOnAutoComplete = function () {
                            if (scope.subjectList()) {
                                scope.autocomplete.subjectList = createListAutoComplete();
                            }
                        };

                        scope.clickOnItem = function(subjectFromAutoComplete){
                            var subject = SubjectService.getById(subjectFromAutoComplete.id);
                            scope.$emit('E_RESET_SELECTED_LIST', subject);
                            subject.selected = true;
                            scope.$emit('E_SELECT_SUBJECT', subject);
                            scope.currentFolderId =  subject.folder_id || null;

                        };

                        function createListAutoComplete() {
                            var array = [];
                            angular.forEach(scope.subjectList(), function (value) {
                                var folder = null,
                                    folderString = "";
                                if (value.folder_id) {
                                    folder = FolderService.folderById(value.folder_id);
                                    if (folder) {
                                        folderString = " (" + folder.label + ")";
                                    }
                                }
                                var obj = {
                                    title: value.title,
                                    name: value.title + folderString,
                                    id: value.id,
                                    toString: function () {
                                        return this.name;
                                    }
                                };
                                array.push(obj);
                            });
                            return array;
                        }

                        /**
                         * GETTER
                         */

                        scope.subjectList = function () {
                            return SubjectService.getList();
                        };

                        scope.folderList = function () {
                            return FolderService.getList();
                        };

                        scope.canManageFolder = function (fodler) {
                            return true;
                        };
                        scope.canManageSubject = function (subject) {
                            return true;
                        };

                        scope.getSubjectPicture = function (subject) {
                            var defaultPicture = '/assets/themes/leo/img/illustrations/poll-default.png';
                            return subject.picture || defaultPicture;
                        };

                        /**
                         * EVENT
                         */

                        scope.clickOnFolderTitle = function (folder) {
                            scope.data.selectAll = false;
                            scope.setCurrentFolder(folder);
                        };

                        scope.canAccessSubject = function(subject){
                            if(model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager) || model.me.hasRight(subject, 'owner')){
                                return true;
                            } else{
                                return false;
                            }
                        };

                        scope.setCurrentFolder = function (folder) {
                            scope.$emit('E_RESET_SELECTED_LIST');
                            scope.display.tab = 'mySubject';
                            scope.currentFolderId = folder.id;
                        };

                        scope.clickOnSubjectTitle = function (subject) {
                            if (subject.id) {
                                if(model.me.hasRight(subject, 'owner')){
                                    //console.log('owner')
                                    $location.path('/subject/edit/' + subject.id);
                                } else if(model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager)){
                                    //console.log('manager');
                                    $location.path('/subject/edit/' + subject.id);
                                } else if(model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.contrib)){
                                    //console.log('contrib');
                                    $location.path('/subject/edit/' + subject.id);
                                } else{
                                    //console.log('read');
                                    AccessService.reader = true;
                                    $location.path('/subject/copy/preview/perform/' + subject.id);
                                }
                            }
                        };
                        scope.viewPreview = function (subject) {
                            if (subject.id) {
                                $location.path('/subject/copy/preview/perform/' + subject.id);
                            }
                        };

                        scope.selectFolder = function (folder) {
                            folder.selected = folder.selected ? true : false;
                            scope.$emit('E_SELECT_FOLDER', folder);
                        };
                        
                        scope.selectSubject = function (subject) {
                            subject.selected = subject.selected ? true : false;
                            scope.$emit('E_SELECT_SUBJECT', subject);

                        };

                        scope.clickCreateFolder = function () {
                            scope.$emit('E_CREATE_FOLDER');
                        };

                        scope.addNewSubject = function() {
                            scope.$emit('E_ADD_NEW_SUBJECT', null);
                        };


                        scope.goToRoot = function () {
                            scope.$emit('E_RESET_SELECTED_LIST');
                            scope.currentFolderId = null;
                        };

                        scope.selectAllFn = function(selectAll){
                            angular.forEach(scope.folderList(), function(folder){
                                if(scope.filterFolderByParentFolder(folder)){
                                    folder.selected = selectAll ? true : false;
                                    scope.$emit('E_SELECT_FOLDER', folder);
                                }
                            });
                            angular.forEach(scope.subjectList(), function(subject){
                                if(scope.filterSubjectByParentFolder(subject)){
                                    subject.selected = selectAll ? true : false;
                                    scope.$emit('E_SELECT_SUBJECT', subject);
                                }
                            });
                        };

                        /**
                         * FILTER
                         */

                        scope.filterFolderByParentFolderId = function () {
                            return function (folder) {
                                if(scope.currentFolderId){
                                    return folder.parent_folder_id == scope.currentFolderId
                                } else{
                                    return folder.parent_folder_id == null;
                                }
                            };
                        };

                        scope.filterFolderTab = function (currentTab) {
                            return function (folder) {
                                if(currentTab  === 'mySubject'){
                                    return true
                                } else{
                                    return false;
                                }

                            };
                        };

                        scope.filterSubjectTab = function (currentTab) {
                            return function (subject) {
                               if(model.me.hasRight(subject, 'owner') && currentTab == 'mySubject'){
                                   return true
                               } else if(!model.me.hasRight(subject, 'owner') && currentTab == 'subjectShared') {
                                   return true

                               } else{
                                   return false;
                               }
                            };
                        };

                        scope.filterSubjectByParentFolderId = function (currentTab) {
                            return function (subject) {
                                if(currentTab == 'subjectShared'){
                                    return true;
                                } else{
                                    if(scope.currentFolderId){
                                        return subject.folder_id == scope.currentFolderId
                                    } else{
                                        return subject.folder_id == null;
                                    }
                                }


                            };
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
