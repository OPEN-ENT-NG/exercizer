import { ng } from 'entcore';
import { ScoreHelper } from '../../../../models/helpers';

export const viewSummary = ng.directive('viewSummary',
    [() => {
        return {
            restrict: 'E',
            scope: {
                subjectScheduled: '=',
                subjectCopy: '=',
                isTeacher: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/undefined/templates/view-summary.html',
            link:(scope:any) => {

                scope.formatNumber = function(score:number): any {
                    return ScoreHelper.format(score)
                };
                
                scope.updateSubjectCopy = function() {
                    scope.$emit('E_UPDATE_SUBJECT_COPY', scope.subjectCopy, false);
                };
            }
        };
    }]
);