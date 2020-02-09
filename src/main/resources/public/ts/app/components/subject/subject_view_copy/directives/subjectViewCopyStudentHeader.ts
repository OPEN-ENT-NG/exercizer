import { ng } from 'entcore';

export const subjectViewCopyStudentHeader = ng.directive('subjectViewCopyStudentHeader',
    ['$location', ($location) => {
        return {
            restrict: 'E',
            scope: {
                subjectScheduled: '=',
                subjectCopy: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/subject/subject_view_copy/templates/subject-view-copy-student-header.html',
            link:(scope:any) => {
                scope.redirectToDashboard = function() {
                    $location.path('/dashboard');
                };
                scope.redirectToTrainingSubjects = function() {
                    $location.path('/dashboard/student').search({tab: 'training'});
                };
                scope.redirectToSubjects = function() {
                    if (scope.subjectCopy.is_training_copy) {
                        scope.redirectToTrainingSubjects();
                    } else {
                        scope.redirectToDashboard();
                    }
                }
            }
        };
    }]
);