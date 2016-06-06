directives.push(
    {
        name: 'editOrder',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/order/templates/edit-order.html',
                link:(scope:any) => {


                    scope.addAnswer = function(){
                        var newOrder = parseFloat(getLastOrder()) + 1;
                        var newAnswer = {
                            order_by : newOrder,
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

                    function getLastOrder(){
                        var maxOrder = null;
                        angular.forEach(scope.grain.grain_data.custom_data.correct_answer_list, function(value, key){
                            if(maxOrder === null || value.order_by > maxOrder){
                                maxOrder = value.order_by;
                            }
                        });
                        if(maxOrder === null){
                            return 0;
                        }
                        return maxOrder;

                    }

                    scope.reOrder = function(){
                        angular.forEach(scope.grain.grain_data.custom_data.correct_answer_list, function(value){
                            if(value.order_by != parseFloat(value.index) + 1){
                                value.order_by = parseFloat(value.index) + 1;
                            }
                        });
                        scope.$emit('E_UPDATE_GRAIN',scope.grain);
                    };

                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        scope.grain.grain_data.custom_data = new OrderCustomData();
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






