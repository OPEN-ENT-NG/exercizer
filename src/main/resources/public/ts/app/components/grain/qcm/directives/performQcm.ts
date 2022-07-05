import { ng } from 'entcore';

export const performQcm = ng.directive('performQcm',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainCopy: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/qcm/templates/perform-qcm.html',
            link:(scope:any) => {
                scope.textNotEmpty = (answer, index, filteredAnswersList) => {
                    return answer.text !== "";
                }
                scope.updateGrainCopy = function() {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };

            }
        };
    }]
);







