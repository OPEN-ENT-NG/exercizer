import { ng } from 'entcore';

export const subjectPerformCopyStudentHeader = ng.directive('subjectPerformCopyStudentHeader',
    ['$location', 'DateService', ($location, DateService) => {
        return {
            restrict: 'E',
            scope: {
                subjectScheduled: '=',
                subjectCopy: '=',
                isCanSubmit: '=',
                currentGrainCopy: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/subject/subject_perform_copy/templates/subject-perform-copy-student-header.html',
            link:(scope:any) => {
                
                scope.isModalDisplayed = false;

                scope.redirectToDashboard = function(submit:boolean) {
                    if (scope.subjectCopy.is_training_copy) {
                        scope.saveCurrentGrain();
                    }
                    if (submit) {
                        scope.isModalDisplayed = true;
                    } else {
                        scope.subjectCopy.has_been_started = true;
                        $location.path('/dashboard');
                    }
                };              
                
                scope.saveCurrentGrain = function() {
                    scope.subjectCopy.current_grain_id = scope.currentGrainCopy ? scope.currentGrainCopy.id : -1;
                    scope.$emit('E_SUBJECT_COPY_LATER', scope.subjectCopy.id, scope.subjectCopy.current_grain_id);
                }

                scope.canSubmit = function(){
                    //it's possible to submit if the begin date is passed even if due date is exceeded (Unless it has already submit)
                    return scope.isCanSubmit && DateService.compare_after(new Date(), DateService.isoToDate(scope.subjectScheduled.begin_date), true) &&
                        (scope.subjectCopy.submitted_date === null || canReplace());
                };

                function canReplace() {
                    return scope.subjectCopy.submitted_date != null && !scope.subjectScheduled.is_one_shot_submit &&
                        DateService.compare_after(DateService.isoToDate(scope.subjectScheduled.due_date), new Date(), true);
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
);