import { ng } from 'entcore';
import { StringISOHelper, ScoreHelper } from '../../../../../models/helpers';

export const grainCopyFooter = ng.directive('grainCopyFooter',
    [() => {
        return {
            restrict: 'E',
            scope : {
                grainScheduled: '=',
                grainCopy: '=',
                isTeacher: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/common/grain_copy/templates/grain-copy-footer.html',
            link:(scope:any) => {
                scope.isFolded = false;

                scope.hasAnswerExplanation = function() {
                    return !angular.isUndefined(scope.grainScheduled.grain_data.answer_explanation) && scope.grainScheduled.grain_data.answer_explanation !== null;
                };
                
                scope.hasComment = function() {
                    return !angular.isUndefined(scope.grainCopy.comment)  && scope.grainCopy.comment !== null;
                };

                scope.toggle = function() {
                    scope.isFolded = !scope.isFolded;
                };

                scope.updateGrainCopy = function() {
                    if (scope.isTeacher) {
                        scope.grainCopy.comment = StringISOHelper.toISO(scope.grainCopy.comment);
                        scope.grainCopy.final_score = new Number(scope.grainCopy.final_score).valueOf();
                        if (isNaN( scope.grainCopy.final_score)) scope.grainCopy.final_score = 0;
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }
                };

                scope.formatNumber = function(score:number): any {
                    return ScoreHelper.format(score)
                };
            }
        };
    }]
);
