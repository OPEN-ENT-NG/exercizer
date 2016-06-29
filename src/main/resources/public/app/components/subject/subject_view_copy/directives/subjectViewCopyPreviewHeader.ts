directives.push(
    {
        name: 'subjectViewCopyPreviewHeader',
        injections: ['$location', 'SubjectCopyService', ($location, SubjectCopyService) => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    previewingFromLibrary: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_view_copy/templates/subject-view-copy-preview-header.html',
                link:(scope:any) => {

                    scope.redirectToTeacherDashboardLibraryTab = function() {
                        if (scope.previewingFromLibrary) {
                            $location.path('/dashboard/teacher/library');
                        }
                    };

                    scope.redirectToSubjectEdit = function() {
                        if (!scope.previewingFromLibrary) {
                            $location.path('/subject/edit/' + scope.subjectScheduled.subject_id + '/');
                        }
                    };

                    scope.redirectToSubjectPreviewPerformCopy = function() {
                        SubjectCopyService.tmpPreviewData = undefined;

                        $location.path('/subject/copy/preview/perform/' + scope.subjectScheduled.subject_id + '/');
                    };
                }
            };
        }]
    }
);