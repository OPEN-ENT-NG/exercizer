directives.push(
    {
        name: 'subjectPerformCopyBottomNav',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    'grainCopyList': '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_perform_copy/templates/subject-perform-copy-bottom-nav.html',
                link:(scope:any) => {
                    scope.currentGrainCopy = undefined;
                    scope.currentGrainCopyIndex = undefined;
                    
                    scope.grainCopyList = scope.grainCopyList.sort(function (grainCopyA:IGrainCopy, grainCopyB:IGrainCopy) {
                        return (grainCopyA.order_by > grainCopyB.order_by ? 1 : -1);
                    });

                    scope.hasPrevious = function() {
                        return !angular.isUndefined(scope.currentGrainCopy);
                    };
                    
                    scope.hasNext = function() {
                        return (angular.isUndefined(scope.currentGrainCopy) && (!angular.isUndefined(scope.grainCopyList) && scope.grainCopyList.length > 0))
                            || scope.currentGrainCopyIndex < scope.grainCopyList.length - 1;
                    };
                    
                    scope.navigateToPrevious = function() {
                        if (scope.hasPrevious()) {
                            _navigateTo(scope.grainCopyList[scope.currentGrainCopyIndex - 1]);
                        }
                    };
                    
                    scope.navigateToNext = function() {
                        if (scope.hasNext()) {
                            _navigateTo(scope.grainCopyList[angular.isUndefined(scope.currentGrainCopy) ? 0 : scope.currentGrainCopyIndex + 1]);
                        }
                    };
                    
                    function _navigateTo(grainCopy:IGrainCopy = undefined) {
                        scope.$emit('E_CURRENT_GRAIN_COPY_CHANGED', grainCopy);
                    }

                    scope.$on('E_CURRENT_GRAIN_COPY_CHANGE' , function(event, grainCopy:IGrainCopy) {
                        scope.currentGrainCopy = grainCopy;
                        scope.currentGrainCopyIndex = angular.isUndefined(grainCopy) ? undefined : scope.grainCopyList.indexOf(grainCopy);
                    });
                }
            };
        }]
    }
);

