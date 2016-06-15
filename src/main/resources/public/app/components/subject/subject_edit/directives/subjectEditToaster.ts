directives.push(
    {
        name: 'subjectEditToaster',
        injections: ['GrainService', 'SubjectService', 'SubjectEditService', (GrainService:IGrainService, SubjectService:ISubjectService, SubjectEditService:ISubjectEditService) => {
            return {
                restrict: 'E',
                scope: {
                    subject: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-toaster.html',
                link:(scope:any) => {
                    
                    var isModalRemoveSelectedGrainListDisplayed = false;
                    
                    scope.isToasterDisplayed = function() {
                        return SubjectEditService.getGrainSelectedListBySubjectId(scope.subject.id).length > 0;
                    };
                    
                    scope.isModalRemoveSelectedGrainListDisplayed = function() {
                        return isModalRemoveSelectedGrainListDisplayed;
                    };
                    
                    scope.displayModalRemoveSelectedGrainList = function() {
                        isModalRemoveSelectedGrainListDisplayed = true;
                    };
                    
                    scope.closeModalRemoveSelectedGrainList = function() {
                        isModalRemoveSelectedGrainListDisplayed = false;
                    };

                    scope.duplicateSelectedGrainList = function() {
                        GrainService.duplicateList(SubjectEditService.getGrainSelectedListBySubjectId(scope.subject.id), scope.subject).then(
                            function() {
                                SubjectService.update(scope.subject, true).then(
                                    function() {
                                        SubjectEditService.deselectGrainListBySubjectId(scope.subject.id);
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                );
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };

                    scope.removeSelectedGrainList = function() {
                        GrainService.removeList(SubjectEditService.getGrainSelectedListBySubjectId(scope.subject.id), scope.subject).then(
                            function() {
                                SubjectService.update(scope.subject, true).then(
                                    function() {
                                        SubjectEditService.deselectGrainListBySubjectId(scope.subject.id);
                                        isModalRemoveSelectedGrainListDisplayed = false;
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                );
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };
                    
                    scope.resetSelection = function() {
                        SubjectEditService.deselectGrainListBySubjectId(scope.subject.id);
                    };
                }
            };
        }]
    }
);


