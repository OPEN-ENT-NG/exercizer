directives.push(
    {
        name: 'viewSummary',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    subjectCopy: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/undefined/templates/view-summary.html',
                link:(scope:any) => {
                    scope.$watch(scope.subjectCopy.calculated_score, function() {
                        if (angular.isUndefined(scope.subjectCopy.final_score)) {
                            scope.subjectCopy.final_score = angular.isUndefined(scope.subjectCopy.calculated_score) ? 0 : angular.copy(scope.subjectCopy.calculated_score);
                        }
                    });
                    
                    
                    scope.updateSubjectCopy = function() {
                        scope.$emit('E_UPDATE_SUBJECT_COPY', scope.subjectCopy, false);
                    };
                }
            };
        }]
    }
);