directives.push(
    {
        name: "teacherDashboardToaster",
        injections: ['FolderService','SubjectService', (FolderService,SubjectService) => {
            return {
                restrict: "E",
                scope : {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/templates/teacher-dashboard-toaster.html',
                link:(scope : any, element, attrs) => {

                    scope.subjectList = [];
                    scope.folderList = [];

                    function hide(){
                        scope.isHidden = true;
                    }
                    hide();

                    scope.$on("E_DISPLAY_DASHBOARD_TOASTER", function (event, subjectList, folderList) {
                        var length = subjectList.length + folderList.length;
                        if(length === 0){
                            hide();
                        } else{
                            scope.isHidden = false;
                            scope.subjectList = subjectList;
                            scope.folderList = folderList;
                        }
                    });

                    var listToasterItem = [
                        {
                            publicName : "Propriétes",
                            actionOnClick : function(){
                                if(scope.folderList.length == 1){
                                    // folder is selected
                                    var folder = FolderService.folderById(scope.folderList[0]);
                                    scope.$emit("E_EDIT_FOLDER", folder);

                                }
                                if(scope.subjectList.length == 1){
                                    // subject is selected
                                    var subject = SubjectService.getById(scope.subjectList[0]);
                                    scope.$emit("E_EDIT_SUBJECT", subject);
                                }
                            },
                            display : function(){
                                return scope.folderList.length + scope.subjectList.length == 1;
                            }
                        },
                        {
                            publicName : "Partager",
                            actionOnClick : function(){
                                console.log('Not implemented');
                            },
                            display : function(){
                                return false;
                            }
                        },
                        {
                            publicName : "Programmer",
                            actionOnClick : function(){
                                var subject = SubjectService.getById(scope.subjectList[0]);
                                scope.$emit("E_SCHEDULE_SUBJECT", subject);
                            },
                            display : function(){
                                return scope.subjectList.length == 1 && scope.folderList.length == 0
                            }
                        },
                        {
                            publicName : "Publier dans la bibliothèque",
                            actionOnClick : function(){
                                console.log('Not implemented');
                            },
                            display : function(){
                                return false;
                            }
                        },
                        {
                            publicName : "Copier",
                            actionOnClick : function(){
                                scope.$emit("E_COPY_SELECTED_FOLDER_SUBJECT");
                            },
                            display : function(){
                                return true;
                            }
                        },
                        {
                            publicName : "Supprimer",
                            actionOnClick : function(){
                                scope.$emit("E_REMOVE_SELECTED_FOLDER_SUBJECT");
                                hide();
                            },
                            display : function(){
                                return true;
                            }
                        }
                    ];

                    scope.itemList = listToasterItem;

                }
            };
        }]
    }
);
