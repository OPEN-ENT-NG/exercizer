directives.push(
    {
        name: 'teacherDashboardFolderEdit',
        injections: ['FolderService', 'SubjectService', (FolderService, SubjectService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/templates/teacher-dashboard-folder-edit.html',
                link: (scope:any, element, attrs) => {

                    scope.isDisplayed = false;
                    scope.currentFolder = {};

                    // event to display model
                    scope.$on("E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER", function(event, folder) {
                        scope.folder = folder;
                        if(folder){
                            scope.state = 'edit';
                            scope.currentFolder = {};
                            scope.currentFolder.label = angular.copy(folder.label);

                        } else {
                            scope.state = 'create';
                            scope.currentFolder = {};

                        }
                        scope.isDisplayed = true;
                    });

                    scope.save = function () {
                        if(scope.state === 'create'){
                            var folder = new Folder();
                            folder.label = angular.copy(scope.currentFolder.label);
                            FolderService.createFolder(folder, null, null);
                        } else if(scope.state === 'edit'){
                            scope.folder.label = angular.copy(scope.currentFolder.label);
                            FolderService.updateFolder(scope.folder, null, null);
                        }
                        scope.hide();
                    };

                    // hide model
                    scope.hide = function () {
                        scope.isDisplayed = false;
                    };
                }
            };
        }]
    }
);
