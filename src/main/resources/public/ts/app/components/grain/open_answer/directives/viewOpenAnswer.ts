import { ng } from 'entcore';

export const viewOpenAnswer = ng.directive('viewOpenAnswer',
    ['$sce', 'OpenAnswerService', ($sce, OpenAnswerService) => {
        return {
            restrict: 'E',
            scope: {
                grainScheduled: '=',
                grainCopy: '=',
                grainCopyList: '=',
                isTeacher: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/open_answer/templates/view-open-answer.html',
            link: (scope:any) => {

                var result = OpenAnswerService.automaticCorrection(scope.grainScheduled, scope.grainCopy);
                if (angular.isUndefined(scope.grainCopy.calculated_score) || scope.grainCopy.calculated_score === null) {
                    scope.grainCopy.calculated_score = result.calculated_score;
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                }

                scope.openAnswerHtml = $sce.trustAsHtml(scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer);

                scope.updateGrainCopy = function () {
                    if (scope.isTeacher) {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }
                };
            }
        };
    }]
);







