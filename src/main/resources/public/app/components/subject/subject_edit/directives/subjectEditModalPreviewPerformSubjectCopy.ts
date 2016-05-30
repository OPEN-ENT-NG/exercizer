directives.push(
    {
        name: 'subjectEditModalPreviewPerformSubjectCopy',
        injections:
            [
                'E_DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT_COPY',
                (
                    E_DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT_COPY
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-modal-preview-perform-subject-copy.html',
                        link:(scope:any) => {

                            scope.isPreview = true;
                            scope.isDisplayed = false;

                            scope.close = function() {
                                scope.isDisplayed = false;
                            };

                            scope.getPerformSubjectCopyURL = function() {
                                return '/exercizer/public/template/perform-subject-copy.html';
                            };

                            scope.$on(E_DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT_COPY + scope.subject.id, function() {
                                scope.isDisplayed = true;
                            });
                        }
                    };
                }
            ]
    }
);
