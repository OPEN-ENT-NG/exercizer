directives.push(
    {
        name: "simpleAnswerAutoCorrection",
        injections: [ 'SimpleAnswerService',(SimpleAnswerService) => {
            return {
                restrict: "E",
                scope: {
                    grainCopy : "=",
                    grainScheduled : "="
                },
                templateUrl: 'exercizer/public/app/components/directives/common_grain/grainCalculatedScore.html',

                link:(scope : any, element, attrs) => {
                    scope.$watch('grainCopy', function() {
                        SimpleAnswerService.automaticCorrection(scope.grainCopy, scope.grainScheduled);
                    }, true);

                }
            };
        }]
    }
);






