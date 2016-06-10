directives.push(
    {
        name: 'performQcm',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/qcm/templates/perform-qcm.html',
                link:(scope:any) => {

                    scope.updateGrainCopy = function() {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    };

                }
            };
        }]
    }
);







