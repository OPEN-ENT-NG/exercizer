directives.push(
    {
        name: "orderAutoCorrection",
        injections: [ 'OrderService',(OrderService) => {
            return {
                restrict: "E",
                scope: {
                    grainCopy : "=",
                    grainScheduled : "="
                },
                templateUrl: 'exercizer/public/app/components/directives/common_grain/grainCalculatedScore.html',

                link:(scope : any, element, attrs) => {
                    scope.$watch('grainCopy', function() {
                        OrderService.automaticCorrection(scope.grainCopy, scope.grainScheduled);
                    }, true);

                }
            };
        }]
    }
);






