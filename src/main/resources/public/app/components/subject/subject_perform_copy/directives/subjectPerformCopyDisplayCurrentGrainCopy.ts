directives.push(
    {
        name: 'subjectPerformCopyDisplayCurrentGrainCopy',
        injections:
            [
                'E_CURRENT_GRAIN_COPY_CHANGE',
                (
                    E_CURRENT_GRAIN_COPY_CHANGE
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subjectScheduled: '=',
                            subjectCopy: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_perform_copy/templates/subject-perform-copy-display-current-grain-copy.html',
                        link:(scope:any) => {
                            scope.currentGrainCopy = undefined;
                            
                            scope.$on(E_CURRENT_GRAIN_COPY_CHANGE + scope.subjectCopy.id, function(event, grainCopy:IGrainCopy) {
                               scope.currentGrainCopy = grainCopy; 
                            });
                        }
                    };
                }
            ]
    }
);

