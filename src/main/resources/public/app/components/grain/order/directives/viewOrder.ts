directives.push(
    {
        name: 'viewOrder',
        injections: ['OrderService', (OrderService) => {
            return {
                restrict: 'E',
                scope: {
                    grainScheduled: '=',
                    grainCopy: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/order/templates/view-order.html',
                link:(scope:any) => {

                    if (angular.isUndefined(scope.grainCopy.calculated_score)) {
                        var result = OrderService.automaticCorrection(scope.grainScheduled, scope.grainCopy);
                        scope.grainCopy.calculated_score = result.calculated_score;
                        scope.isCorrect = result.answers_result;
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }

                    scope.updateGrainCopy = function() {
                        if (scope.isTeacher) {
                            scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                        }
                    };
                }
            };
        }]
    }
);







