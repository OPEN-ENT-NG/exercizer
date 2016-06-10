directives.push(
    {
        name: 'grainCopyFooter',
        injections: [() => {
            return {
                restrict: 'E',
                scope : {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_copy/templates/grain-copy-footer.html',
                link:(scope:any) => {
                    scope.isFolded = true;

                    scope.hasAnswerExpalantion = function() {
                        return !angular.isUndefined(scope.grainCopy.grain_copy_data.answer_explanation);
                    };

                    scope.toggle = function() {
                        scope.isFolded = !scope.isFolded;
                    }
                }
            };
        }]
    }
);
