directives.push(
    {
        name: 'teacherDashboardRemoveSelectedFolderAndSubject',
        injections: ['FolderService', 'SubjectService', (FolderService, SubjectService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/templates/teacher-dashboard-remove-selected-folder-and-subject.html',
                link: (scope:any, element, attrs) => {

                    scope.isDisplayed = false;

                    // event to display model
                    scope.$on("E_DISPLAY_DASHBOARD_MODAL_REMOVE_SELECTED_FOLDER_SUBJECT", function(event, selectedSubjectList, selectedFolderList) {
                        scope.isDisplayed = true;
                        scope.subjectList = selectedSubjectList;
                        scope.folderList = selectedFolderList;
                    });

                    // confirm delete
                    scope.deleteSelection = function () {
                        scope.$emit("E_CONFIRM_REMOVE_SELECTED_FOLDER_SUBJECT");
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
