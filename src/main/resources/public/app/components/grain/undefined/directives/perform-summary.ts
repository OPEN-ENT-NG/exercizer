directives.push(
    {
        name: 'performSummary',
        injections: ['DateService', (DateService)  => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    previewing: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/undefined/templates/perform-summary.html',
                link(scope: any){
                    scope.canShowFuturSubmitLabel = function(){
                        return DateService.compare_after(DateService.isoToDate(scope.subjectScheduled.begin_date), new Date(), false);
                    };
                }
            };
        }
        ]
    }
);

