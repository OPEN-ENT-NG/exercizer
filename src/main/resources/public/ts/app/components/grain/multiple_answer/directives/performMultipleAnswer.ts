import { ng } from 'entcore';

export const performMultipleAnswer = ng.directive('performMultipleAnswer',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainCopy: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/multiple_answer/templates/perform-multiple-answer.html',
            link:(scope:any) => {
                scope.updateGrainCopy = function() {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };
            }
        };
    }]
);







