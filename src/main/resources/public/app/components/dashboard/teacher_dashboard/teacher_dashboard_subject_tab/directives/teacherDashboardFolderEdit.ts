directives.push(
    {
        name: 'teacherDashboardFolderEdit',
        injections: ['FolderService', (FolderService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-folder-edit.html',
                link: (scope:any) => {

                    scope.isDisplayed = false;
                    scope.currentFolder = {};

                    // event to display model
                    scope.$on('E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER', function(event, folder) {
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
                        if (!scope.currentFolder.label || scope.currentFolder.label.length === 0) {
                            notify.error('Veuillez renseigner un nom de dossier.');
                        } else {
                            
                            if(scope.state === 'create'){
                                var folder = new Folder();
                                folder.label = angular.copy(scope.currentFolder.label);
                                FolderService.persist(folder);
                            } else if(scope.state === 'edit'){
                                scope.folder.label = angular.copy(scope.currentFolder.label);
                                FolderService.update(scope.folder);
                            }
                            
                            scope.hide();
                        }
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
