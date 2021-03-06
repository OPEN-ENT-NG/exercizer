import { ng } from 'entcore';
import { SimpleAnswerCustomData } from '../models/SimpleAnswerCustomData';

export const editSimpleAnswer = ng.directive('editSimpleAnswer',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/simple_answer/templates/edit-simple-answer.html',
            link:(scope:any) => {

                if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                    scope.grain.grain_data.custom_data = new SimpleAnswerCustomData();
                }

                scope.updateGrain = function() {
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };
            }
        };
    }]
);






