directives.push(
    {
        name: 'editOrder',
        injections: ['GrainService', 'SubjectEditService', (GrainService:IGrainService, SubjectEditService:ISubjectEditService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/order/templates/edit-order.html',
                link:(scope:any) => {

                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        scope.grain.grain_data.custom_data = new OrderCustomData();
                    }

                    function _updateGrain() {
                        GrainService.update(scope.grain).then(
                            function(grain:IGrain) {
                                scope.grain = grain;
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    }
                    
                    scope.addAnswer = function(){
                        var newOrder = parseFloat(getLastOrder()) + 1;
                        var newAnswer = {
                            order_by : newOrder,
                            index : newOrder - 1,
                            text : ''
                        };
                        scope.grain.grain_data.custom_data.correct_answer_list.push(newAnswer);
                        _updateGrain();
                    };

                    scope.deleteAnswer = function(answer){
                        var indexDeleted = answer.index;
                        var index = scope.grain.grain_data.custom_data.correct_answer_list.indexOf(answer);
                        if(index !== -1){
                            scope.grain.grain_data.custom_data.correct_answer_list.splice(index, 1);
                        }
                        angular.forEach(scope.grain.grain_data.custom_data.correct_answer_list, function(value){
                            if(value.index > indexDeleted){
                                value.index = parseFloat(value.index) - 1;
                            }
                        });
                        scope.reOrder();
                    };

                    function getLastOrder(){
                        var maxOrder = null;
                        angular.forEach(scope.grain.grain_data.custom_data.correct_answer_list, function(value){
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
                        _updateGrain();
                    };

                    scope.isGrainFolded = function() {
                        return SubjectEditService.isGrainFolded(scope.grain);
                    };

                    scope.updateGrain = function() {
                        _updateGrain();
                    };
                }
            };
        }
        ]
    }
);






