directives.push(
    {
        name: 'subjectPerformCopyStudentHeader',
        injections: ['$location', ($location) => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    subjectCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_perform_copy/templates/subject-perform-copy-student-header.html',
                link:(scope:any) => {
                    
                    scope.isModalDisplayed = false;

                    scope.redirectToDashboard = function(submit:boolean) {
                        if (submit) {
                            scope.isModalDisplayed = true;
                        } else {
                            $location.path('/dashboard');
                        }
                    };
                    
                    scope.closeModal = function() {
                        scope.isModalDisplayed = false;
                    };
                    
                    scope.submitSubjectCopy = function() {
                        scope.$emit('E_SUBJECT_COPY_SUBMITTED', scope.subjectCopy);
                    };
                    
                    scope.$on('E_SUBMIT_SUBJECT_COPY', function() {
                        $location.path('/dashboard');
                    })
                }
            };
        }]
    }
);