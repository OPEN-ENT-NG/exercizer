import { ng } from 'entcore';

export const teacherDashboardCopyPaste = ng.directive('teacherDashboardCopyPaste',
    ['FolderService', 'SubjectService', (FolderService, SubjectService) => {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-copy-paste.html',
            link: (scope:any) => {

                scope.isDisplayed = false;
                scope.data = {
                    selectedFolder : null
                };
                scope.allFolderList = FolderService.folderList;

                // event to display model
                scope.$on('E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE', function(event, selectedSubjectList, selectedFolderList, fromLibrary = false) {
                    scope.isDisplayed = true;
                    scope.allFolderList = FolderService.folderList;
                    scope.fromLibrary = fromLibrary;
                    scope.subjectList = selectedSubjectList;
                    scope.folderList = selectedFolderList;
                });

                // confirm paste
                scope.pasteSelection = function () {
                    var folder = null;
                    if (scope.data.selectedFolder) {
                        folder = FolderService.folderById(scope.data.selectedFolder);
                    }
                    scope.$emit('E_CONFIRM_COPY_PASTE', folder);
                    scope.isDisplayed = false;
                    scope.list = null;
                };

                // hide model
                scope.hide = function () {
                    scope.isDisplayed = false;
                    scope.list = null;
                    scope.$emit('E_RESET_SELECTED_LIST');
                };

                // get label of folder
                scope.getFolderLabelById = function(id){
                    var folder = FolderService.folderById(id);
                    return folder? folder.label : null;
                };

                // get title of subject
                scope.getSubjectTitleById = function(id){
                    var subject = SubjectService.getById(id);
                    return subject ? subject.title : null;
                }
            }
        };
    }]
);
