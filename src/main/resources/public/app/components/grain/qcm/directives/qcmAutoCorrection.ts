directives.push(
    {
        name: "qcmAutoCorrection",
        injections: [ 'QcmService',(QcmService) => {
            return {
                restrict: "E",
                scope: {
                    grainCopy : "=",
                    grainScheduled : "="
                },
                templateUrl: 'exercizer/public/app/components/directives/common_grain/grainCalculatedScore.html',

                link:(scope : any, element, attrs) => {
                    scope.$watch('grainCopy', function() {
                        QcmService.automaticCorrection(scope.grainCopy, scope.grainScheduled);
                    }, true);

                }
            };
        }]
    }
);






