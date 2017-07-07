import { ng } from 'entcore';

export const teacherDashboardSubjectExport = ng.directive('teacherDashboardSubjectExport',
    ['FolderService', 'SubjectService','$location', (FolderService, SubjectService, $location) => {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-subject-export.html',
            link: (scope:any) => {

                scope.$on('E_DISPLAY_DASHBOARD_MODAL_EXPORT_SUBJECT', function(event, subject) {
                    if(subject !== null){
                        scope.isNewSubject = false;
                        scope.step = 'subject';
                        scope.subject = subject;
                    }
                    scope.isDisplayed = true;
                });


                scope.exportMoodle = function(subjectCopy) {
                    window.location.href = '/exercizer/subject/export-moodle/' + scope.subject.id + '/'+ scope.subject.title;
                    scope.hide();
                };

                scope.hide = function () {
                    scope.isDisplayed = false;
                    scope.list = null;
                    scope.$emit('E_RESET_SELECTED_LIST');
                };


            }
        };
    }]
);