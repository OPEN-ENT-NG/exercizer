import { ng, idiom } from 'entcore';

export const performSummary = ng.directive('performSummary',
    ['DateService', (DateService)  => {
        return {
            restrict: 'E',
            scope: {
                subjectScheduled: '=',
                subjectCopy : '=',
                previewing: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/undefined/templates/perform-summary.html',
            link(scope: any){
                scope.canShowFuturSubmitLabel = function(){
                    return DateService.compare_after(DateService.isoToDate(scope.subjectScheduled.begin_date), new Date(), false);
                };
                scope.translate = idiom.translate;
            }
        };
    }]
);

