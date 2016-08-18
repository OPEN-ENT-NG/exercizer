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

                    scope.setHover = function(index){
                        angular.forEach(scope.data.hover, function(current_hover, key){
                            current_hover.bool = (key == index);
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

                    scope.dropConditionFunction = function (targetItem, $originalEvent, index) {
                        scope.setHover(index);
                        return DragService.dropConditionFunction(targetItem, $originalEvent);
                    };

                    scope.deleteFilledAnswer = function(filled_answer){
                        filled_answer.text_right = null;
                        scope.resetPossibleAnswerLeftList();
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


                    /*scope.isAlreadySet = function(array_filtered) {
                        return function (possible_answer) {
                            var number_possible = 0;
                            angular.forEach(scope.grainCopy.grain_copy_data.custom_copy_data.possible_answer_list, function(current_possisble_answer){
                                if(possible_answer.text_right == current_possisble_answer.text_right){
                                    number_possible ++;
                                }
                            });

                            var number_filled = 0;
                            angular.forEach(scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer_list, function(current_filled_answer){
                                if(possible_answer.text_right == current_filled_answer.text_right){
                                    number_filled ++;
                                }
                            });

                            var number_filtered = null;
                            if(array_filtered !== 'undefined'){
                                number_filtered = 0;
                                angular.forEach(array_filtered, function(current_filtered_answer){
                                    if(possible_answer.text_right == current_filtered_answer.text_right){
                                        number_filtered ++;
                                    }
                                });
                            }

                            if(number_filled >= number_possible){
                                return false;
                            } else{
                                if(number_filtered !== null){

                                }
                            }
                        };
                    };*/
                }
            };
        }]
    }
);







