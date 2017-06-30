import { ng, model, Behaviours } from 'entcore';

export const teacherDashboardToaster = ng.directive('teacherDashboardToaster', ['FolderService','SubjectService', (FolderService,SubjectService) => {
        return {
            restrict: 'E',
            scope : {},
            controller: function($scope) {
                $scope.isDisplayed = false;
            },
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-toaster.html',
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
                            if (length === 0 || (subjectList.length > 0 && folderList.length > 0)) {
                                hide();
                            } else{
                                scope.isDisplayed = true;
                                scope.subjectList = subjectList;
                                scope.folderList = folderList;
                                checkRightFn(subjectList);
                            }
                        });

                        function checkRightFn(subjectList){
                            var isOneRead = false;
                            var isOneManage = false;
                            var isOneContrib = false;
                            var isOneOwner = false;

                            angular.forEach(subjectList, function(id){
                                var subject = SubjectService.getById(id);
                                if(model.me.hasRight(subject, 'owner')){
                                    //scope.lowerRight = 'owner';
                                    isOneOwner = true
                                }
                                else if(model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.manager)){
                                    //scope.lowerRight = 'manager';
                                    isOneManage = true;
                                }
                                else if(model.me.hasRight(subject, Behaviours.applicationsBehaviours.exercizer.rights.resource.contrib)){
                                    //scope.lowerRight = 'contrib';
                                    isOneContrib = true;
                                }
                                else{
                                    //scope.lowerRight = 'read';
                                    isOneRead = true;
                                }
                            });

                            if (isOneRead) {
                                scope.lowerRight = 'read';
                            } else if (isOneContrib) {
                                scope.lowerRight = 'contrib';
                            } else if (isOneManage) {
                                scope.lowerRight = 'manager';
                            } else if (isOneOwner) {
                                scope.lowerRight = 'owner';
                            }
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
                                            var subject = SubjectService.getById(scope.subjectList[0]);
                                            return (scope.lowerRight == 'owner' || scope.lowerRight == 'manager') && subject.type === 'interactive';
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
                                publicName : 'Distribuer',
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
                                    return scope.subjectList.length == 1 && scope.folderList.length == 0 && ( scope.lowerRight == 'owner');
                                    //|| scope.lowerRight == 'manager');
                                }
                            },
                            {
                                publicName : 'Copier',
                                actionOnClick : function(){
                                    scope.$emit('E_COPY_SELECTED_FOLDER_SUBJECT');
                                },
                                display : function(){
                                    return (scope.subjectList.length > 0 && scope.folderList.length == 0) || (scope.subjectList.length == 0 && scope.folderList.length > 0);
                                }
                            },
                            {
                                publicName : 'Déplacer',
                                actionOnClick : function(){
                                    scope.$emit('E_MOVE_SELECTED_FOLDER_SUBJECT');
                                },
                                display : function(){
                                    if(scope.subjectList.length == 0){
                                        // is only folder
                                        return true;
                                    } else {
                                        return scope.subjectList.length > 0 && scope.folderList.length == 0 &&
                                            scope.lowerRight == 'owner';
                                    }
                                }
                            },
                            {
                                publicName : 'Exporter',
                                actionOnClick : function(){
                                    var subject = SubjectService.getById(scope.subjectList[0]);
                                    scope.$emit('E_EXPORT_SELECTED_SUBJECT', subject);
                                },
                                display : function(){
                                    if(scope.folderList.length + scope.subjectList.length == 1){
                                        // only one item
                                        if(scope.subjectList.length == 1){
                                            // is subject
                                            var subject = SubjectService.getById(scope.subjectList[0]);
                                            return (scope.lowerRight == 'owner' || scope.lowerRight == 'manager') && subject.type === 'interactive';
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
                                        return scope.subjectList.length > 0 && scope.folderList.length == 0 &&
                                            (scope.lowerRight == 'manager' || scope.lowerRight == 'owner');
                                    }
                                }
                            }
                        ];
                    }
                }
            },
        };
    }]
);
