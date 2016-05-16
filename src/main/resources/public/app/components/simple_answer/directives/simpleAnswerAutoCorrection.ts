/// <reference path="./../../../typings/angular-1.2.d.ts"/>
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
                link:(scope : any, element, attrs) => {
                    scope.$watch('grainCopy', function() {
                        SimpleAnswerService.automaticCorrection(scope.grainCopy, scope.grainScheduled);
                    }, true);

                }
            };
        }]
    }
);






