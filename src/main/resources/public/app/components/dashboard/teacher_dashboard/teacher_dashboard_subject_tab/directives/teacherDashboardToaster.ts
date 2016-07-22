directives.push(
    {
        name: 'teacherDashboardToaster',
        injections: ['FolderService','SubjectService', (FolderService,SubjectService) => {
            return {
                restrict: 'E',
                scope : {},
                controller: function($scope) {
                    $scope.isDisplayed = false;
                },
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-toaster.html',
                compile: function(element, attributes){
                    return {
                        pre: function(scope, element, attributes, controller, transcludeFn){
                        },
                        post: function(scope, element, attributes, controller, transcludeFn){
                            scope.subjectList = [];
                            scope.folderList = [];
                            scope.lowerRight = null;

                            function hide(){
                                scope.isDisplayed = false;
                            }
                            hide();

                            scope.$on('E_DISPLAY_DASHBOARD_TOASTER', function (event, subjectList, folderList) {
                                var length = subjectList.length + folderList.length;
                                if(length === 0){
                                    hide();
                                } else{
                                    scope.isDisplayed = true;
                                    scope.subjectList = subjectList;
                                    scope.folderList = folderList;
                                    checkRightFn(subjectList);
                                }
                            });

                            function checkRightFn(subjectList){
                                angular.forEach(subjectList, function(id){
                                    var subject = SubjectService.getById(id);
                                    if(model.me.hasRight(subject, 'owner')){
                                        scope.lowerRight = 'owner';
                                    }
                                    else if(model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager)){
                                        scope.lowerRight = 'manager';
                                    }
                                    else if(model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.contrib)){
                                        scope.lowerRight = 'contrib';
                                    }
                                    else{
                                        scope.lowerRight = 'read';
                                    }
                                });
                            }

                            scope.itemList = [
                                {
                                    publicName : 'Propriétés',
                                    actionOnClick : function(){
                                        if(scope.folderList.length == 1){
                                            // folder is selected
                                            var folder = FolderService.folderById(scope.folderList[0]);
                                            scope.$emit('E_EDIT_FOLDER', folder);

                                        }
                                        if(scope.subjectList.length == 1){
                                            // subject is selected
                                            var subject = SubjectService.getById(scope.subjectList[0]);
                                            scope.$emit('E_EDIT_SUBJECT', subject);
                                        }
                                    },
                                    display : function(){
                                        if(scope.folderList.length + scope.subjectList.length == 1){
                                            // only one item
                                            if(scope.subjectList.length == 1){
                                                // is subject
                                                return scope.lowerRight == 'owner' || scope.lowerRight == 'manager';
                                            } else {
                                                //is folder
                                                return true;
                                            }
                                        } else{
                                            return false;
                                        }
                                    }
                                },
                                {
                                    publicName : 'Partager',
                                    actionOnClick : function(){
                                        var subject = SubjectService.getById(scope.subjectList[0]);
                                        scope.$emit('E_SHARE_SUBJECT', subject);
                                    },
                                    display : function(){
                                        return scope.subjectList.length == 1 && scope.folderList.length == 0 && ( scope.lowerRight == 'owner' || scope.lowerRight == 'manager');
                                    }
                                },
                                {
                                    publicName : 'Programmer',
                                    actionOnClick : function(){
                                        var subject = SubjectService.getById(scope.subjectList[0]);
                                        scope.$emit('E_SCHEDULE_SUBJECT', subject);
                                    },
                                    display : function(){
                                        return scope.subjectList.length == 1 && scope.folderList.length == 0 && ( scope.lowerRight == 'owner' || scope.lowerRight == 'contrib' || scope.lowerRight == 'manager');
                                    }
                                },
                                {
                                    publicName : 'Publier dans la bibliothèque',
                                    actionOnClick : function(){
                                        var subject = SubjectService.getById(scope.subjectList[0]);
                                        scope.$emit('E_PUBLISH_SUBJECT', subject);
                                    },
                                    display : function(){
                                        return scope.subjectList.length == 1 && scope.folderList.length == 0 && ( scope.lowerRight == 'owner' || scope.lowerRight == 'manager');
                                    }
                                },
                                {
                                    publicName : 'Copier',
                                    actionOnClick : function(){
                                        scope.$emit("E_COPY_SELECTED_FOLDER_SUBJECT");
                                    },
                                    display : function(){
                                        return true;
                                    }
                                },
                                {
                                    publicName : 'Supprimer',
                                    actionOnClick : function(){
                                        scope.$emit('E_REMOVE_SELECTED_FOLDER_SUBJECT');
                                        hide();
                                    },
                                    display : function(){
                                        if(scope.subjectList.length == 0){
                                            // is only folder
                                            return true;
                                        } else {
                                            return scope.lowerRight == 'manager' || scope.lowerRight == 'owner';
                                        }
                                    }
                                }
                            ];
                        }
                    }
                },
            };
        }]
    }
);
