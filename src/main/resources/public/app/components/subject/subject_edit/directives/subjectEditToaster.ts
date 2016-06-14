directives.push(
    {
        name: 'subjectEditToaster',
        injections: ['GrainService', (GrainService:IGrainService) => {
            return {
                restrict: 'E',
                scope: {
                    subject: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-toaster.html',
                link:(scope:any) => {
                    scope.isModalDisplayed = false;
                    
                    scope.isDisplayed = function() {
                        return GrainService.getSelectedListBySubject(scope.subject).length > 0;
                    };
                    
                    scope.isRemoveSelectedGrainListModalDisplayed = function() {
                        return scope.isModalDisplayed;
                    };
                    
                    scope.displayRemoveSelectedGrainListModal = function() {
                        scope.isModalDisplayed = true;
                    };
                    
                    scope.closeRemoveSelectedGrainListModal = function() {
                        scope.isModalDisplayed = false;
                    };

                    scope.duplicateSelectedGrainList = function() {
                        GrainService.duplicateList(GrainService.getSelectedListBySubject(scope.subject), scope.subject).then(
                            function() {
                                scope.resetSelection();
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };

                    scope.confirmRemoveSelectedGrainList = function() {
                        GrainService.removeList(GrainService.getSelectedListBySubject(scope.subject), scope.subject).then(
                            function() {
                                scope.resetSelection();
                                scope.closeRemoveSelectedGrainListModal();
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };
                    
                    scope.resetSelection = function() {
                        GrainService.resetSelectedListBySubject(scope.subject);
                    };
                }
            };
        }]
    }
);


