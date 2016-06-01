directives.push(
    {
        name: 'subjectPerformCopyPreviewHeader',
        injections:
            [() => {
                    return {
                        restrict: 'E',
                        scope: {
                            subjectScheduled: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_perform_copy/templates/subject-perform-copy-preview-header.html',
                        link:(scope:any) => {

                            // TODO preview subject copy view
                        }
                    };
                }
            ]
    }
);