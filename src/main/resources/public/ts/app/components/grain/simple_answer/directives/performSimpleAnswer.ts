import { ng } from 'entcore';

export const performSimpleAnswer = ng.directive('performSimpleAnswer',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainCopy: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/simple_answer/templates/perform-simple-answer.html',
            link:(scope:any) => {
                scope.updateGrainCopy = function() {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };
            }
        };
    }]
);







