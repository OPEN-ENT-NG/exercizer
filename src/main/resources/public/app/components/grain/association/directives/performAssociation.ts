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
                        var dataField = DragService.dropConditionFunction(targetItem, $originalEvent);
                        var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
                        targetItem.text_right = angular.copy(originalItem.text_right);
                        scope.$apply();
                        scope.updateGrainCopy();

                    };

                    scope.dropConditionFunction = function (targetItem, $originalEvent) {
                        return DragService.dropConditionFunction(targetItem, $originalEvent);
                    };

                    scope.deleteFilledAnswer = function(filled_answer){
                        filled_answer.text_right = null;
                    };


                    scope.isAlreadySet = function() {
                        return function (possible_answer) {
                            var bool = true;
                            angular.forEach(scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer_list, function(filled_answer_list){
                               if(filled_answer_list.text_right == possible_answer.text_right){
                                   bool =  false;
                               }
                            });
                                return bool;
                        };
                    };


                }
            };
        }]
    }
);







