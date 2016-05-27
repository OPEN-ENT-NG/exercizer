directives.push(
    {
        name: 'subjectEditModalPreviewPerformSubject',
        injections:
            [
                'E_DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT',
                (
                    E_DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-preview-perform-subject.html',
                        link:(scope:any) => {

                            scope.isDisplayed = false;
                            scope.subjectScheduled = undefined;
                            scope.grainScheduled = undefined;
                            scope.subjectCopy = undefined;
                            scope.grainCopyList = undefined;

                            scope.close = function() {
                                scope.isDisplayed = false;
                            };

                            scope.getPerformSubjectURL = function() {
                                return '/exercizer/public/template/perform-subject.html';
                            };

                            scope.$on(E_DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT + scope.subject.id, function(event, subjectScheduled:ISubjectScheduled, grainScheduledList:IGrainScheduled, subjectCopy:ISubjectCopy, grainCopyList:IGrainCopy[]) {
                                scope.subjectScheduled = subjectScheduled;
                                scope.grainScheduled = grainScheduledList;
                                scope.subjectCopy = subjectCopy;
                                scope.grainCopyList = grainCopyList;
                                scope.isDisplayed = true;
                            });
                        }
                    };
                }
            ]
    }
);
