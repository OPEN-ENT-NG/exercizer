directives.push(
    {
        name: 'subjectCopyLeftNav',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    'subjectCopy': '=',
                    'grainList': '='
                },
                templateUrl: 'exercizer/public/app/components/subject/common/subject_copy/templates/subject-copy-left-nav.html',
                link:(scope:any) => {
                    scope.currentGrainCopy = undefined;

                    scope.$on('E_CURRENT_GRAIN_COPY_CHANGE' , function(event, grainCopy:IGrainCopy) {
                        scope.currentGrainCopy = grainCopy;
                    });
                }
            };
        }]
    }
);

