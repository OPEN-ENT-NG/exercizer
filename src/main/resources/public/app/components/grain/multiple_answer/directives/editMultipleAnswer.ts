directives.push(
    {
        name: 'editMultipleAnswer',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/multiple_answer/templates/edit-multiple-answer.html',
                link:(scope:any) => {

                    scope.addAnswer = function(text = ''){
                        var newAnswer = {
                            text : text
                        };
                        scope.grain.grain_data.custom_data.correct_answer_list.push(newAnswer);
                        scope.$emit('E_UPDATE_GRAIN', scope.grain);
                    };

                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        scope.grain.grain_data.custom_data = new MultipleAnswerCustomData();
                        scope.addAnswer( 'Réponse 1');
                        scope.addAnswer( 'Réponse 2');
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
    }
);






