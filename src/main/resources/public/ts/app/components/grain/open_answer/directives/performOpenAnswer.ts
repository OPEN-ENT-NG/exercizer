import { ng } from 'entcore';
import { StringISOHelper } from '../../../../models/helpers';

export const performOpenAnswer = ng.directive('performOpenAnswer',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainCopy: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/open_answer/templates/perform-open-answer.html',
            link:(scope:any, element:any) => {
                scope.updateGrainCopy = function() {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };

                /**
                 * Event JQuery because no ng-blur on editor
                 */
                element.find('editor').on('editor-blur', function(){
                    scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer = StringISOHelper.toISO(scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer);
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                });
            }
        };
    }]
);







