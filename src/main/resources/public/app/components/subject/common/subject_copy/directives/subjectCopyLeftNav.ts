directives.push(
    {
        name: 'subjectCopyLeftNav',
        injections: ['GrainTypeService', (GrainTypeService) => {
            return {
                restrict: 'E',
                scope: {
                    'grainCopyList': '=',
                    'anchorBehaviour': '='
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
                        if (grainCopy) {
                            var article = jQuery("article#" + grainCopy.id)
                            if(article.length)
                                jQuery('html, body').animate({ scrollTop: article.offset().top - 70 }, 500);
                        }
                        scope.$emit('E_CURRENT_GRAIN_COPY_CHANGED', grainCopy, scope.grainCopyList);
                    };

                    scope.getCorrectOrder = function(grainCopy:IGrainCopy) {
                        return CorrectOrderHelper.getCorrectOrder(grainCopy, scope.grainCopyList);
                    };

                    scope.$on('E_CURRENT_GRAIN_COPY_CHANGE' , function(event, grainCopy:IGrainCopy) {
                        scope.currentGrainCopy = grainCopy;

                        if (scope.anchorBehaviour) {
                            //jQuery('html, body').animate({ scrollTop: jQuery(angular.isUndefined(grainCopy) ? '#summary' : '#' + grainCopy.id).offset().top - 100}, 500);
                        }
                    });
                }
            };
        }]
    }
);

