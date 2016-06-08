directives.push(
    {
        name: 'performSimpleAnswer',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/simple_answer/templates/perform-simple-answer.html',
                link:(scope:any) => {

                    if (angular.isUndefined(scope.grainCopy.grain_copy_data.custom_copy_data)) {
                        scope.grainCopy.grain_copy_data.custom_copy_data = new SimpleAnswerCustomCopyData();
                    }
                    
                    scope.updateGrainCopy = function() {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    };
                }
            };
        }]
    }
);







