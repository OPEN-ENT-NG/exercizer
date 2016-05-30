directives.push(
    {
        name: 'subjectCopyLeftNav',
        injections:
            [
                'E_CURRENT_GRAIN_COPY_CHANGE',
                (
                    E_CURRENT_GRAIN_COPY_CHANGE
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            'subjectCopy': '=',
                            'grainList': '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/common/subject_copy/templates/subject-copy-left-nav.html',
                        link:(scope:any) => {
                            scope.currentGrainCopy = undefined;

                            scope.$on(E_CURRENT_GRAIN_COPY_CHANGE + scope.subjectCopy.id , function(event, grainCopy:IGrainCopy) {
                                scope.currentGrainCopy = grainCopy;
                            });
                        }
                    };
                }
            ]
    }
);

