directives.push(
    {
        name: 'subjectPerformCopyPreviewHeader',
        injections: ['$location', ($location) => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_perform_copy/templates/subject-perform-copy-preview-header.html',
                link:(scope:any) => {

                    scope.redirectToSubjectEdit = function() {
                        $location.path('/subject/edit/' + scope.subjectScheduled.subject_id + '/');
                    };
                    
                    // TODO preview subject copy view
                }
            };
        }]
    }
);