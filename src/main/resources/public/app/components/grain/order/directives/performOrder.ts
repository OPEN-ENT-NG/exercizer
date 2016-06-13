directives.push(
    {
        name: 'performOrder',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/order/templates/perform-order.html',
                link:(scope:any) => {

                    scope.updateGrainCopy = function() {
                        scope.$emit("E_UPDATE_GRAIN_COPY", scope.grainCopy);
                    };

                    scope.reOrder = function () {
                        angular.forEach(scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer_list, function (filled_answer) {
                            if (filled_answer.order_by != parseInt(filled_answer.index) + 1) {
                                filled_answer.order_by = parseInt(filled_answer.index) + 1;
                                scope.$emit("E_UPDATE_GRAIN_COPY", scope.grainCopy);
                            }
                        });
                    };

                }
            };
        }]
    }
);







