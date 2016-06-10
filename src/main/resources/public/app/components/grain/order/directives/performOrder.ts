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

                }
            };
        }]
    }
);







