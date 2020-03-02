import { ng } from 'entcore';
import { angular } from 'entcore';

export const performAssociation = ng.directive('performAssociation',
    ['DragService', (DragService) => {
        return {
            restrict: 'E',
            scope: {
                grainCopy: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/association/templates/perform-association.html',
            link: (scope:any) => {

                scope.$watch("grainCopy",function(newValue,oldValue) {
                    scope.resetPossibleAnswerLeftList();
                });

                scope.data = {
                    hover : []
                };

                scope.setHover = function(index , right = false, left = false){
                    scope.data.hover.forEach(function(current_hover, key){
                        current_hover.bool = (key == index);
                        current_hover.left = left && (key == index);
                        current_hover.right = right && (key == index);
                    });
                    scope.$apply();
                };


                scope.updateGrainCopy = function () {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };

                scope.dropTo = function ($item, targetItem, index) {
                    scope.setHover(index);
                    targetItem.text_right = angular.copy($item.text_right);
                    scope.resetPossibleAnswerLeftList();
                    scope.$apply();
                    scope.updateGrainCopy();
                };

                scope.dropToLeft = function ($item, targetItem, index, right, left) {
                    scope.setHover(index, right, left);
                    if(targetItem.text_left){
                        scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                            item : angular.copy(targetItem.text_left),
                            rank : 0.5 - Math.random()
                        });
                    }
                    targetItem.text_left = angular.copy($item.item);
                    scope.$apply();
                    scope.all_possible_answer_pop(targetItem.text_left);
                    scope.updateGrainCopy();
                };

                scope.dropToRight = function ($item, targetItem, index, right, left) {
                    scope.setHover(index, right, left);
                    if(targetItem.text_right){
                        scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                            item : angular.copy(targetItem.text_right),
                            rank : 0.5 - Math.random()
                        });
                    }
                    targetItem.text_right = angular.copy($item.item);
                    scope.$apply();
                    scope.all_possible_answer_pop(targetItem.text_right);
                    scope.updateGrainCopy();
                };


                /*scope.drag = function (possible_answer, $originalEvent) {
                    try {
                        $originalEvent.dataTransfer.setData('application/json', JSON.stringify(possible_answer));
                    } catch (e) {
                        $originalEvent.dataTransfer.setData('Text', JSON.stringify(possible_answer));
                    }
                };

                scope.dropTo = function (targetItem, $originalEvent) {
                    scope.setHover(null);
                    var dataField = DragService.dropConditionFunction(targetItem, $originalEvent);
                    var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
                    targetItem.text_right = angular.copy(originalItem.text_right);
                    scope.resetPossibleAnswerLeftList();
                    scope.$apply();
                    scope.updateGrainCopy();
                };

                scope.dropToLeft = function (targetItem, $originalEvent) {
                    scope.setHover(null);
                    if(targetItem.text_left){
                        scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                            item : angular.copy(targetItem.text_left),
                            rank : 0.5 - Math.random()
                        });
                    }
                    var dataField = DragService.dropConditionFunction(targetItem, $originalEvent);
                    var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
                    targetItem.text_left = angular.copy(originalItem.item);
                    //scope.resetPossibleAnswerLeftList();
                    scope.$apply();
                    scope.all_possible_answer_pop(targetItem.text_left);
                    scope.updateGrainCopy();
                };

                scope.dropToRight = function (targetItem, $originalEvent) {
                    scope.setHover(null);
                    if(targetItem.text_right){
                        scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                            item : angular.copy(targetItem.text_right),
                            rank : 0.5 - Math.random()
                        });
                    }
                    var dataField = DragService.dropConditionFunction(targetItem, $originalEvent);
                    var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
                    targetItem.text_right = angular.copy(originalItem.item);
                    //scope.resetPossibleAnswerLeftList();
                    scope.$apply();
                    scope.all_possible_answer_pop(targetItem.text_right);
                    scope.updateGrainCopy();
                };

                    scope.dropConditionFunction = function (targetItem, $originalEvent, index, right , left ) {
                    scope.setHover(index, right, left);
                    return DragService.dropConditionFunction(targetItem, $originalEvent);
                    };

                */

                scope.all_possible_answer_pop = function(item, left, right){
                    var index = null;
                    angular.forEach(scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer, function(current, key){
                        if(item == current.item){
                            index = key;
                        }
                    });
                    if(index !== null){
                        scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.splice(index, 1);
                        scope.$apply();
                    } else{
                        console.error('not found');
                    }
                };

                scope.deleteFilledAnswer = function(filled_answer){
                    filled_answer.text_right = null;
                    scope.resetPossibleAnswerLeftList();
                };

                scope.deleteFilledAnswerLeft = function(filled_answer){
                    if (filled_answer && filled_answer.text_left !== null) {
                        scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                            item: angular.copy(filled_answer.text_left),
                            rank: 0.5 - Math.random()
                        });
                    }
                    filled_answer.text_left= null;

                };

                scope.deleteFilledAnswerRight = function(filled_answer){
                    if (filled_answer && filled_answer.text_right !== null) {
                        scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                            item : angular.copy(filled_answer.text_right),
                            rank : 0.5 - Math.random()
                        });
                    }
                    filled_answer.text_right = null;

                };

                scope.resetPossibleAnswerLeftList = function(){
                    scope.possible_answer_left_list = angular.copy(scope.grainCopy.grain_copy_data.custom_copy_data.possible_answer_list);
                    var indexToRemove;
                    angular.forEach(scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer_list, function(current_filled_answer){
                        if(current_filled_answer.text_right){
                            indexToRemove = null;
                            angular.forEach(scope.possible_answer_left_list, function(current_possible_left_answer, index){
                                if(current_filled_answer.text_right == current_possible_left_answer.text_right){
                                    indexToRemove = index;
                                }
                            });
                            if(indexToRemove !== null){
                                scope.possible_answer_left_list.splice(indexToRemove, 1);
                            }
                        }
                    });
                };

                let _selectedanswer;

                scope.showAnswers = function(ele, filled_answer) {
                    scope.showAnswersMobile = true;
                    $('.association__right').removeClass('item-selected');
                    $(ele.target).addClass('item-selected');
                    _selectedanswer = filled_answer;
                    ele.stopPropagation();
                }

                scope.selectAnswer = function(possible_answer) {
                    scope.deleteFilledAnswer(_selectedanswer);
                    scope.showAnswersMobile = false;
                    _selectedanswer.text_right = possible_answer.text_right;
                    $('.association__right').removeClass('item-selected');
                    var indexToRemove = null;
                    angular.forEach(scope.possible_answer_left_list, function(current_possible_left_answer, index){
                        if(possible_answer.text_right == current_possible_left_answer.text_right){
                            indexToRemove = index;
                        }
                    });
                    if(indexToRemove !== null){
                        scope.possible_answer_left_list.splice(indexToRemove, 1);
                    }
                    scope.$apply();
                }

                $('body').on('click', event => {
                    if (scope.showAnswersMobile && !$(event.target).hasClass('tap-tap') && !$(event.target).parents('.tap-tap').length) {
                        scope.showAnswersMobile = false;
                        $('.association__right').removeClass('item-selected');
                        scope.$apply();
                    }
                });
            }
        };
    }]
);







