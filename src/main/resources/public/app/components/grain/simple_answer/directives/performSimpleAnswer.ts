directives.push(
    {
        name: 'simpleAnswerPerform',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/simple_answer/templates/perform-simple-answer.html',
                link:(scope:any) => {

                    scope.updateGrainCopy = function() {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    };

                }
            };
        }]
    }
);







