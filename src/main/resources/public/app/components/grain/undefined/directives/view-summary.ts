directives.push(
    {
        name: 'viewSummary',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    subjectCopy: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/undefined/templates/view-summary.html'
            };
        }
        ]
    }
);