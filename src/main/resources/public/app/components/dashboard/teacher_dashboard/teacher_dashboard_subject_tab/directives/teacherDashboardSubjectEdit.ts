directives.push(
    {
        name: 'teacherDashboardSubjectEdit',
        injections: ['FolderService', 'SubjectService','$location', (FolderService, SubjectService,$location) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-subject-edit.html',
                link: (scope:any) => {

                    scope.$on('E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT', function(event, subject, currentFolderId) {

                        if(subject !== null){
                            scope.isNewSubject = false;
                            scope.step = 'subject';
                            scope.subject = subject;                            
                        } else {
                            scope.isNewSubject = true;
                            scope.subject= new Subject();
                            scope.subject.folder_id = currentFolderId;
                        }
                        scope.isDisplayed = true;
                    });


                    scope.saveSubjectProperties = function() {
                        if (!scope.subject.title || scope.subject.title.length === 0) {
                            notify.error('exercizer.check.title');
                        } else {
                            if (scope.isNewSubject) {
                                SubjectService.persist(scope.subject).then(function(subject) {
                                    SubjectService.currentSubjectId = subject.id;                                    
                                    $location.path('/subject/edit/' + subject.id);
                                    scope.closeLightbox();
                                }, function(err) {
                                    notify.error(err);
                                });
                            } else {
                                SubjectService.update(scope.subject).then(function() {
                                    SubjectService.currentSubjectId = undefined;
                                    scope.closeLightbox();
                                }, function(err) {
                                    notify.error(err);
                                });
                            }
                        }
                    };
                    
                    scope.nextStep = function(type) {
                        scope.step = "subject";
                        scope.subject.type = type;
                        scope.type = type;
                        
                        if (type === 'simple') {
                            scope.closeLightbox();
                            $location.path('/subject/create/simple/');
                        }                        
                    };

                    scope.closeLightbox = function() {
                        scope.isDisplayed = false;
                        reset();
                    };
                    
                    var reset = function() {
                        scope.isDisplayed = false;
                        scope.step = "choose";
                    };

                    reset();
                }
            };
        }]
    }
);