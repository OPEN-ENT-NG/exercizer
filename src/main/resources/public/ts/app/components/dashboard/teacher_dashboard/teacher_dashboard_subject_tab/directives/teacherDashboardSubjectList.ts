
import { ng, model, Behaviours, notify, skin, $ } from 'entcore';
import { Subject } from '../../../../../models/domain';

export const teacherDashboardSubjectList = ng.directive('teacherDashboardSubjectList', ['SubjectService', 'ImportService', 'FolderService', 'DragService', '$location','AccessService',
    (SubjectService, ImportService, FolderService, DragService, $location, AccessService) => {
        return {
            restrict: 'E',
            scope: {
                subject: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-subject-list.html',
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

                scope.isImportDisplayed = false;
                scope.fileImportName = '';
                scope.importSubject = new Subject();
                scope.stateImport = 'begin';
                scope.grainImportCount = 0;
                scope.unsupported = [];
                scope.loadingImport = false;

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

                scope.checkboxClick = function(item) {
                    item.selected = !item.selected;
                }

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


                scope.amITheAuthor = function(subject){
                    return model.me.hasRight(subject, 'owner');
                };

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
                    var defaultPicture = skin.basePath + 'img/illustrations/image-default.svg';
                    return subject.picture || defaultPicture;
                };

                /**
                 * EVENT
                 */

                scope.openFolder = function (folder) {
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

                scope.openSubject = function (subject) {
                    // This code is duplicated in teacherDashboardToaster.ts
                    if (subject.id) {
                        if ('simple' === subject.type) {
                            $location.path('/subject/edit/simple/' + subject.id);
                        } else {
                            if (model.me.hasRight(subject, 'owner')) {
                                $location.path('/subject/edit/' + subject.id);
                            } else if (model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager)) {
                                $location.path('/subject/edit/' + subject.id);
                            } else if (model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.contrib)) {
                                $location.path('/subject/edit/' + subject.id);
                            } else {
                                AccessService.reader = true;
                                $location.path('/subject/copy/preview/perform/' + subject.id);
                            }
                        }
                    }
                };
                scope.viewPreview = function (subject) {
                    if (subject.id) {
                        $location.path('/subject/copy/preview/perform/' + subject.id);
                    }
                };

                scope.selectFolder = function (folder) {
                    scope.$emit('E_SELECT_FOLDER', folder);
                };
                
                scope.selectSubject = function (subject) {
                    scope.$emit('E_SELECT_SUBJECT', subject);

                };

                scope.clickCreateFolder = function (currentFolderId) {
                    scope.$emit('E_CREATE_FOLDER', currentFolderId);
                };

                scope.addNewSubject = function(currentFolderId) {
                    scope.$emit('E_ADD_NEW_SUBJECT', currentFolderId);
                };

                scope.importNewSubject = function() {
                    scope.importSubject = new Subject();
                    scope.isImportDisplayed = true;
                };

                scope.setFilesName = function(event) {
                    scope.fileImportName = '';
                    scope.newFiles = event.newFiles;

                    if (scope.newFiles.length > 0) {
                        var file = scope.newFiles[0];
                        scope.fileImportName = file.name;
                    }
                };

                scope.setStateImport = function(state) {
                    scope.stateImport = state;
                    if (state === 'import')  $('#idFormImport')[0].reset();
                };

                scope.saveImportSubject = function() {
                    if (!scope.importSubject.title || scope.importSubject.title.length === 0) {
                        notify.error('exercizer.check.title');
                    } else if (!scope.fileImportName || scope.fileImportName.length === 0) {
                        notify.error('exercizer.import.check.file');
                    } else {
                        scope.importSubject.folder_id = scope.currentFolderId;

                        scope.loadingImport = true;

                        ImportService.importFile(scope.newFiles[0], scope.importSubject).then(function (objectData) {
                            SubjectService.currentSubjectId = objectData.subject.id;
                            scope.loadingImport = false;
                            scope.stateImport = 'result';
                            scope.grainImportCount = objectData.count;
                            scope.unsupported = objectData.unsupported;
                            scope.newFiles = undefined;
                            scope.$apply();
                        }, function (err) {
                            scope.loadingImport = false;
                            notify.error(err);
                            scope.$apply();
                        });
                    }
                };

                scope.goToSubjectAfterImport = function() {
                    scope.closeImportLightbox();
                    $location.path('/subject/edit/' + SubjectService.currentSubjectId);
                };

                scope.closeImportLightbox = function() {
                    scope.isImportDisplayed = false;
                    scope.stateImport = 'begin';
                    scope.loadingImport = false;
                    scope.grainImportCount = 0;
                    scope.fileImportName = '';
                    scope.newFiles = undefined;
                    scope.unsupported = [];
                };

                scope.goToRoot = function () {
                    scope.$emit('E_RESET_SELECTED_LIST');
                    scope.currentFolderId = null;
                };

                scope.selectAllFn = function(selectAll){
                    angular.forEach(scope.folderList(), function(folder){
                        if(isSelectableFolder(folder)){
                            folder.selected = selectAll ? true : false;
                            scope.$emit('E_SELECT_FOLDER', folder);
                        }
                    });
                    angular.forEach(scope.subjectList(), function(subject){
                        if(isSelectableSubject(subject)){
                            subject.selected = selectAll ? true : false;
                            scope.$emit('E_SELECT_SUBJECT', subject);
                        }
                    });
                };

                function isSelectableFolder(folder){
                    var parent_id;
                    if(scope.currentFolderId){
                        parent_id =  folder.parent_folder_id == scope.currentFolderId
                    } else{
                        parent_id =  folder.parent_folder_id == null;
                    }
                    return parent_id && scope.display.tab  === 'mySubject'
                }

                function isSelectableSubject(subject){
                    var parent_id;
                    var owner;
                    if(scope.display.tab == 'subjectShared'){
                        parent_id =  true;
                    } else{
                        if(scope.currentFolderId){
                            parent_id =  subject.folder_id == scope.currentFolderId
                        } else{
                            parent_id =  subject.folder_id == null;
                        }
                    }
                    //
                    if(model.me.hasRight(subject, 'owner') && scope.display.tab == 'mySubject'){
                        owner =  true
                    } else if(!model.me.hasRight(subject, 'owner') && scope.display.tab == 'subjectShared') {
                        owner =  true

                    } else{
                        owner =  false;
                    }
                    return parent_id && owner;
                }


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

                scope.openArchive = function () {
                    $location.path('/dashboard/teacher/archive');
                }

                scope.displayLibraryIncentive = function () {
                    return model.me.hasWorkflow(Behaviours.applicationsBehaviours.exercizer.rights.workflow.publish) &&
                    scope.subjectList().filter(subject => subject.owner.userId == model.me.userId).length >= 5;
                }
            }
        };
    }]
);
