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
                scope.filledAnswerList = scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer_list;
                scope.filteredAnswersList = [];

                scope.$watch("grainCopy",function() {
                    scope.filteredAnswersList = scope.filledAnswerList.filter(answer => answer.text !== "")
                });

                console.log('qcm', scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer_list);

                scope.updateGrainCopy = function() {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };

            }
        };
    }]
);







