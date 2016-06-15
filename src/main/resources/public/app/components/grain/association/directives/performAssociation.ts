directives.push(
    {
        name: 'performAssociation',
        injections: ['DragService',(DragService) => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/association/templates/perform-association.html',
                link:(scope:any) => {

                    scope.updateGrainCopy = function() {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    };


                    scope.drag = function(possible_answer, $originalEvent){
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

                    }
                }
            };
        }]
    }
);







