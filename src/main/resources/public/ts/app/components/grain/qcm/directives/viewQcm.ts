import { ng } from 'entcore';

export const viewQcm = ng.directive('viewQcm',
    ['QcmService', (QcmService) => {
        return {
            restrict: 'E',
            scope: {
                grainScheduled: '=',
                grainCopy: '=',
                grainCopyList: '=',
                isTeacher: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/qcm/templates/view-qcm.html',
            link: (scope:any) => {

                scope.displayCorrection = false;
                scope.doDisplayCorrection = function() {
                    scope.displayCorrection = !scope.displayCorrection;
                }
                scope.displayCorrectAnswerButton = function() {
                    return !scope.isTeacher && !angular.isUndefined(scope.grainCopy.final_score)
                    && !angular.isUndefined(scope.displayCorrection) && ((scope.grainCopy.final_score == null) || 
                    (scope.grainCopy.final_score < scope.grainCopy.grain_copy_data.max_score));
                };

                var result = QcmService.automaticCorrection(scope.grainScheduled, scope.grainCopy);
                scope.isCorrect = result.answers_result;
                if (angular.isUndefined(scope.grainCopy.calculated_score) || scope.grainCopy.calculated_score === null) {
                    scope.grainCopy.calculated_score = result.calculated_score;
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                }

                scope.updateGrainCopy = function () {
                    if (scope.isTeacher) {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }
                };
            }
        };
    }]
);







