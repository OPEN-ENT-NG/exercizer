directives.push(
    {
        name: 'subjectPerformCopyPreviewHeader',
        injections: ['$location', 'SubjectCopyService', ($location, SubjectCopyService) => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    subjectCopy: '=',
                    grainScheduledList: '=',
                    grainCopyList: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_perform_copy/templates/subject-perform-copy-preview-header.html',
                link:(scope:any) => {

                    scope.redirectToSubjectEdit = function() {
                        $location.path('/subject/edit/' + scope.subjectScheduled.subject_id + '/');
                    };
                    
                    scope.redirectToSubjectPreviewViewCopy = function() {
                        SubjectCopyService.tmpPreviewData = {
                            subjectScheduled: scope.subjectScheduled,
                            subjectCopy: scope.subjectCopy,
                            grainScheduledList: scope.grainScheduledList,
                            grainCopyList: scope.grainCopyList,
                        };

                        $location.path('/subject/copy/view/preview/' + scope.subjectScheduled.subject_id + '/');
                    };
                }
            };
        }]
    }
);