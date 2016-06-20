directives.push(
    {
        name: 'subjectViewCopyTeacherHeader',
        injections: ['$location', ($location) => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    subjectCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_view_copy/templates/subject-view-copy-teacher-header.html',
                link:(scope:any) => {
                    scope.redirectToDashboard = function(isCorrected:boolean) {
                        if (isCorrected) {
                            scope.subjectCopy.is_correction_on_going = true;
                            scope.subjectCopy.is_corrected = true;
                            scope.$emit('E_UPDATE_SUBJECT_COPY', scope.subjectCopy, true);
                        } else {
                            $location.path('/dashboard/teacher/correction/'+scope.subjectScheduled.id);
                        }
                    };
                    
                    scope.$on('E_SUBJECT_COPY_UPDATED', function(event, redirect:boolean) {
                        if (redirect) {
                            $location.path('/dashboard/teacher/correction/'+scope.subjectScheduled.id);
                        }
                    });
                }
            };
        }]
    }
);