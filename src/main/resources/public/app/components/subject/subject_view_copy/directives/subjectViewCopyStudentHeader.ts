directives.push(
    {
        name: 'subjectViewCopyStudentHeader',
        injections: ['$location', ($location) => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    subjectCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_view_copy/templates/subject-view-copy-student-header.html',
                link:(scope:any) => {
                    scope.redirectToDashboard = function() {
                        $location.path('/dashboard');
                    };
                }
            };
        }]
    }
);