directives.push(
    {
        name: 'summary',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/undefined/templates/summary.html'
            };
        }
        ]
    }
);

