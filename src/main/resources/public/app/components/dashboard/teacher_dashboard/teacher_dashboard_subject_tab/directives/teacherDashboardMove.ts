directives.push(
    {
        name: 'teacherDashboardMove',
        injections: ['FolderService', 'SubjectService', (FolderService, SubjectService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-move.html',
                link: (scope:any) => {

                    scope.isDisplayed = false;
                    scope.data = {
                        selectedFolder : null
                    };
                    scope.allFolderList = FolderService.folderList;

                    // event to display model
                    scope.$on('E_DISPLAY_DASHBOARD_MODAL_MOVE', function(event, selectedSubjectList, selectedFolderList) {
                        scope.isDisplayed = true;
                        scope.allFolderList = FolderService.folderList;
                        scope.subjectList = selectedSubjectList;
                        scope.folderList = selectedFolderList;
                    });

                    // confirm move
                    scope. moveSelection = function () {
                        var folder = null;
                        if (scope.data.selectedFolder) {
                            folder = FolderService.folderById(scope.data.selectedFolder);
                        }
                        scope.$emit('E_CONFIRM_MOVE', folder);
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
                    scope.getFolderLabelById = function(id) {
                        var folder = FolderService.folderById(id);
                        return folder? folder.label : null;
                    };

                    // get title of subject
                    scope.getSubjectTitleById = function(id) {
                        var subject = SubjectService.getById(id);
                        return subject ? subject.title : null;
                    };
                }
            };
        }]
    }
);
