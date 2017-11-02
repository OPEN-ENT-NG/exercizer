import { ng, idiom } from 'entcore';
import { OrderCustomData } from '../models/OrderCustomData';

export const editOrder = ng.directive('editOrder',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/order/templates/edit-order.html',
            link:(scope:any) => {

                scope.addAnswer = function(text = ''){
                    var newOrder = (window as any).parseFloat(getLastOrder()) + 1;
                    var newAnswer = {
                        order_by : newOrder,
                        index : newOrder - 1,
                        text : text
                    };
                    scope.grain.grain_data.custom_data.correct_answer_list.push(newAnswer);
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };

                if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                    scope.grain.grain_data.custom_data = new OrderCustomData();
                    scope.addAnswer( idiom.translate('exercizer.grain.order.default1'));
                    scope.addAnswer( idiom.translate('exercizer.grain.order.default2'));
                }

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
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };

                scope.updateGrain = function() {
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };
            }
        };
    }]
);






