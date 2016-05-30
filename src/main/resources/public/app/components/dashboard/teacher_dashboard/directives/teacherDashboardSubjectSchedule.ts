directives.push(
    {
        name: 'teacherDashboardSubjectSchedule',
        injections: ['FolderService', 'SubjectService', (FolderService, SubjectService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/templates/teacher-dashboard-subject-schedule.html',
                link: (scope:any, element, attrs) => {

                    scope.isDisplayed = false;
                    scope.subject = null;

                    // event to display model
                    scope.$on("E_DISPLAY_DASHBOARD_MODAL_SCHEDULE_SUBJECT", function(event, subject) {
                        scope.subject = subject;
                        scope.isDisplayed = true;
                    });

                    // hide model
                    scope.hide = function () {
                        scope.isDisplayed = false;
                    };

                    scope.schedule = function(){
                        console.log('not implemented');
                    }
                }
            };
        }]
    }
);
