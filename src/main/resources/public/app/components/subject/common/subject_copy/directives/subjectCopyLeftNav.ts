directives.push(
    {
        name: 'subjectCopyLeftNav',
        injections: ['GrainTypeService', (GrainTypeService) => {
            return {
                restrict: 'E',
                scope: {
                    'subjectCopy': '=',
                    'grainCopyList': '='
                },
                templateUrl: 'exercizer/public/app/components/subject/common/subject_copy/templates/subject-copy-left-nav.html',
                link:(scope:any) => {
                    scope.currentGrainCopy = undefined;

                    scope.getGrainCopyName = function (grainCopy:IGrainCopy) {
                        if (grainCopy.grain_copy_data && grainCopy.grain_copy_data.title) {
                            return grainCopy.grain_copy_data.title;
                        } else {
                            var grainType = GrainTypeService.getById(grainCopy.grain_type_id);
                            return grainType.public_name;
                        }
                    };
                    
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

