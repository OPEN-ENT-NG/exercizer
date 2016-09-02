directives.push(
    {
        name: 'performAssociation',
        injections: ['DragService', (DragService) => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/association/templates/perform-association.html',
                link: (scope:any) => {

                    scope.data = {
                        hover : []
                    };

                    scope.setHover = function(index , right = false, left = false){
                        angular.forEach(scope.data.hover, function(current_hover, key){
                            current_hover.bool = (key == index);
                            current_hover.left = left && (key == index);
                            current_hover.right = right && (key == index);
                        });
                        scope.$apply();

                    };


                    scope.updateGrainCopy = function () {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    };


                    scope.drag = function (possible_answer, $originalEvent) {
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

                    scope.dropConditionFunction = function (targetItem, $originalEvent, index, right , left ) {
                        scope.setHover(index, right, left);
                        return DragService.dropConditionFunction(targetItem, $originalEvent);
                    };

                    scope.deleteFilledAnswer = function(filled_answer){
                        filled_answer.text_right = null;
                        scope.resetPossibleAnswerLeftList();
                    };

                    scope.deleteFilledAnswerLeft = function(filled_answer){
                        scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                            item : angular.copy(filled_answer.text_left),
                            rank : 0.5 - Math.random()
                        });
                        filled_answer.text_left= null;

                    };

                    scope.deleteFilledAnswerRight = function(filled_answer){
                        scope.grainCopy.grain_copy_data.custom_copy_data.all_possible_answer.push({
                            item : angular.copy(filled_answer.text_right),
                            rank : 0.5 - Math.random()
                        });
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
                    scope.resetPossibleAnswerLeftList();

                }
            };
        }]
    }
);







