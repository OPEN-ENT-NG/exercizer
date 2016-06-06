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

                    scope.addAnswer = function(){
                        var newAnswer = {
                            text : ''
                        };
                        scope.grain.grain_data.custom_data.correct_answer_list.push(newAnswer);
                    };

                    scope.deleteAnswer = function(answer){
                        var index = scope.grain.grain_data.custom_data.correct_answer_list.indexOf(answer);
                        if(index !== -1){
                            scope.grain.grain_data.custom_data.correct_answer_list.splice(index, 1);
                        }
                        scope.updateGrain();
                    };

                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        scope.grain.grain_data.custom_data = new MultipleAnswerCustomData();
                    }

                    scope.isFolded = false;

                    scope.updateGrain = function() {
                        scope.$emit('E_UPDATE_GRAIN', scope.grain);
                    };

                    scope.$on('E_TOGGLE_GRAIN', function(event, grain:IGrain) {
                        if (grain.id === scope.grain.id) {
                            scope.isFolded = !scope.isFolded;
                        }
                    });

                    scope.$on('E_FORCE_FOLDING_GRAIN', function() {
                        scope.isFolded = true;
                    });
                }
            };
        }
        ]
    }
);






