directives.push(
    {
        name: 'teacherDashboardSubjectEdit',
        injections: ['FolderService', 'SubjectService','$location', (FolderService, SubjectService,$location) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/templates/teacher-dashboard-subject-edit.html',
                link: (scope:any) => {

                    scope.isDisplayed = false;

                    scope.$on('E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT', function(event, subject) {

                        if(subject !== null){
                            scope.isNewSubject = false;
                            scope.subject = subject;

                        } else {
                            scope.isNewSubject = true;
                            scope.subject = new Subject();
                        }
                        scope.isDisplayed = true;
                    });


                    scope.saveSubjectProperties = function() {

                        if (!scope.subject.title || scope.subject.title.length === 0) {
                            notify.error('Veuillez renseigner un titre.');
                        } else {

                            if (scope.isNewSubject) {
                                SubjectService.persist(scope.subject).then(function(subject) {
                                    SubjectService.currentSubjectId = subject.id;
                                    $location.path('/subject/edit/' + subject.id);
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

                    scope.closeLightbox = function() {
                        scope.isDisplayed = false;
                    };
                }
            };
        }]
    }
);