import { ng } from 'entcore';

export const subjectViewCopyTeacherFooter = ng.directive('subjectViewCopyTeacherFooter',
    ['$location','SubjectCopyService', ($location, SubjectCopyService) => {
        return {
            restrict: 'E',
            scope: {
                subjectScheduled: '=',
                subjectCopy: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/subject/subject_view_copy/templates/subject-view-copy-teacher-footer.html',
            link:(scope:any) => {
                scope.redirectToDashboard = function(isCorrected:boolean) {
                    if (isCorrected) {
                        var copy = SubjectCopyService.getById(scope.subjectCopy.id);
                        copy.is_correction_on_going = true;
                        copy.is_corrected = true;
                        scope.$emit('E_UPDATE_SUBJECT_COPY', copy, true);
                    } else {
                        $location.path('/dashboard/teacher/correction/'+scope.subjectScheduled.id);
                    }
                };
                
                scope.copyIsCorrected = function(){
                    return scope.subjectCopy.is_corrected;
                };
            }
        };
    }]
);