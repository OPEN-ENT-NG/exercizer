import { ng, idiom } from 'entcore';
import { AssociationCustomData } from '../models/AssociationCustomData';

export const editAssociation = ng.directive('editAssociation',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/association/templates/edit-association.html',
            link:(scope:any) => {

                scope.addAnswer = function(text_left = '', text_right = '') {
                    var newAnswer = {
                        text_left : text_left,
                        text_right : text_right
                    };

                    scope.grain.grain_data.custom_data.correct_answer_list.push(newAnswer);
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };

                if (!scope.grain.grain_data.custom_data) {
                    scope.grain.grain_data.custom_data = new AssociationCustomData();
                    scope.addAnswer();
                }

                scope.deleteAnswer = function(answer){
                    var index = scope.grain.grain_data.custom_data.correct_answer_list.indexOf(answer);
                    if(index !== -1){
                        scope.grain.grain_data.custom_data.correct_answer_list.splice(index, 1);
                    }
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };

                scope.updateGrain = function() {
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };
            }
        };
    }]
);






