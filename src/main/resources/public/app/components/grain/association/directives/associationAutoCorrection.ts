directives.push(
    {
        name: "associationAutoCorrection",
        injections: [ 'AssociationService',(AssociationService) => {
            return {
                restrict: "E",
                scope: {
                    grainCopy : "=",
                    grainScheduled : "="
                },
                templateUrl: 'exercizer/public/app/components/directives/common_grain/grainCalculatedScore.html',

                link:(scope : any, element, attrs) => {
                    scope.$watch('grainCopy', function() {
                        AssociationService.automaticCorrection(scope.grainCopy, scope.grainScheduled);
                    }, true);

                }
            };
        }]
    }
);






