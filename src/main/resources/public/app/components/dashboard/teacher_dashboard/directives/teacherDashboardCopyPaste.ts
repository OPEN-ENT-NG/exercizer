directives.push(
    {
        name: 'teacherDashboardCopyPaste',
        injections: ['FolderService', 'SubjectService', (FolderService, SubjectService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/templates/teacher-dashboard-copy-paste.html',
                link: (scope:any, element, attrs) => {

                    scope.isDisplayed = false;
                    scope.data = {
                        selectedFolder : null
                    };
                    scope.allFolderList = FolderService.folderList;

                    // event to display model
                    scope.$on("E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE", function(event, selectedSubjectList, selectedFolderList) {
                        scope.isDisplayed = true;
                        scope.subjectList = selectedSubjectList;
                        scope.folderList = selectedFolderList;
                    });

                    // confirm delete
                    scope.pasteSelection = function () {
                        var folder = null;
                        if(scope.data.selectedFolder){
                            folder = FolderService.folderById(scope.data.selectedFolder);
                        }
                        scope.$emit("E_CONFIRM_COPY_PASTE", folder);
                        scope.hide();
                    };

                    // hide model
                    scope.hide = function () {
                        scope.isDisplayed = false;
                        scope.list = null;
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
    }
);
