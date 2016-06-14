directives.push(
    {
        name: 'performSummary',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/undefined/templates/perform-summary.html',
                link(scope: any){
                }
            };
        }
        ]
    }
);

