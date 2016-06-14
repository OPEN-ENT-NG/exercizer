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
                    scope.updateSubjectCopy = function() {
                        scope.$emit('E_UPDATE_SUBJECT_COPY', scope.subjectCopy, false);
                    };
                }
            };
        }]
    }
);