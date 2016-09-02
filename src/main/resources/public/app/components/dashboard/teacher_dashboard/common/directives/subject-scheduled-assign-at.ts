directives.push(
    {
        name: 'subjectScheduledAssignAt',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/common/templates/subject-scheduled-assign-at.html',
                link: (scope:any, element, attrs) => {

                    scope.isDisplayed = false;
                    scope.subject = [];

                    // event to display model
                    scope.$on("SEE_SUBJECT_SCHEDULED_ASSIGN_AT", function(event, data) {
                        scope.isDisplayed = true;
                        scope.subjectScheduled = data.subjectScheduled;
                    });

                    // hide model
                    scope.hide = function () {
                        scope.isDisplayed = false;
                    };
                }
            };
        }]
    }
);
