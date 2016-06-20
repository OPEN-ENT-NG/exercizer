directives.push(
    {
        name: 'editAssociation',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/association/templates/edit-association.html',
                link:(scope:any) => {
                    
                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        scope.grain.grain_data.custom_data = new AssociationCustomData();
                    }

                    scope.addAnswer = function() {
                        var newAnswer = {
                            text_left : '',
                            text_right : ''
                        };

                        scope.grain.grain_data.custom_data.correct_answer_list.push(newAnswer);
                        scope.$emit('E_UPDATE_GRAIN', scope.grain);
                    };

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






