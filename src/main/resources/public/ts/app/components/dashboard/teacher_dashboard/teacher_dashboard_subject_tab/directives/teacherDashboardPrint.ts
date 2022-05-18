import { ng, idiom } from 'entcore';

export const teacherDashboardPrint = ng.directive('teacherDashboardPrint',
    ['FolderService', 'SubjectService', (FolderService, SubjectService) => {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-print.html',
            link: (scope:any) => {

                scope.isDisplayed = false;
                scope.data = {
                    selectedSubject : null,
                    value: "true"
                };
                // event to display model
                scope.$on('E_DISPLAY_DASHBOARD_MODAL_PRINT', function (event, subject) {
                    scope.isDisplayed = true;
                    scope.data.value = "true";
                    scope.data.selectedSubject = subject;
                });
                scope.confirm = () => {
                    window.open(`/exercizer#/subject/print/${scope.data.selectedSubject.id}?responses=${scope.data.value}`, '_blank');
                    scope.hide();
                }
                // hide model
                scope.hide = function () {
                    scope.isDisplayed = false;
                    scope.list = null;
                    scope.$emit('E_RESET_SELECTED_LIST');
                };
            }
        };
    }]
);
