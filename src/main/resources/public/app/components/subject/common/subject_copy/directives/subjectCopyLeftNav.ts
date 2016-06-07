directives.push(
    {
        name: 'subjectCopyLeftNav',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    'subjectCopy': '=',
                    'grainCopyList': '='
                },
                templateUrl: 'exercizer/public/app/components/subject/common/subject_copy/templates/subject-copy-left-nav.html',
                link:(scope:any) => {
                    scope.currentGrainCopy = undefined;
                    
                    scope.navigateTo = function(grainCopy:IGrainCopy = undefined) {
                        scope.$emit('E_CURRENT_GRAIN_COPY_CHANGED', grainCopy);
                    };

                    scope.$on('E_CURRENT_GRAIN_COPY_CHANGE' , function(event, grainCopy:IGrainCopy) {
                        scope.currentGrainCopy = grainCopy;
                    });
                }
            };
        }]
    }
);

