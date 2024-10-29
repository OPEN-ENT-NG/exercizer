import { ng, idiom } from 'entcore';
import { Grain } from '../../../../models/domain/Grain';
import { QcmCustomData } from '../models/QcmCustomData';

export const editQcm = ng.directive('editQcm',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/qcm/templates/edit-qcm.html',
            link:(scope:any) => {
                scope.addAnswer = function(isChecked = false, text = '') {
                    var newAnswer = {
                        isChecked : isChecked,
                        text : text
                    };
                    scope.grain.grain_data.custom_data.correct_answer_list.push(newAnswer);
                };

                if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                    scope.grain.grain_data.custom_data = new QcmCustomData();
                    scope.addAnswer(false, '');
                    scope.addAnswer(false, '');
                }

                scope.deleteAnswer = function(answer){
                    var index = scope.grain.grain_data.custom_data.correct_answer_list.indexOf(answer);
                    if (index !== -1) {
                        scope.grain.grain_data.custom_data.correct_answer_list.splice(index, 1);
                    }
                    _updateGrain(scope.grain);
                };

                scope.updateGrain = function() {
                    _updateGrain(scope.grain);
                };

                scope.toggleMultipleAnswers = function() {
                    scope.grain.grain_data.custom_data.multipleAnswers = !scope.grain.grain_data.custom_data.multipleAnswers;
                    _updateGrain(scope.grain);
                };

                const _updateGrain = (grain) => {
                    let savedGrain = new Grain();
                    savedGrain = angular.copy(grain, savedGrain);
                    savedGrain.grain_data.custom_data.correct_answer_list = savedGrain.grain_data.custom_data.correct_answer_list.filter(answer => !!answer.text);
                    savedGrain.grain_data.custom_data.multipleAnswers = grain.grain_data.custom_data.multipleAnswers;
                    scope.$emit('E_UPDATE_GRAIN', savedGrain);
                }
            }
        };
    }]
);






