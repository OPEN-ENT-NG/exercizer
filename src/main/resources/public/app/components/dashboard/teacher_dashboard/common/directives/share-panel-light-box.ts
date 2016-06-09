directives.push(
    {
        name: 'sharePanelLightBox',
        injections: ['$compile',($compile) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/common/templates/share-panel-light-box.html',
                link: (scope:any, element, attrs) => {

                    scope.isDisplayed = false;
                    scope.subject_array = [];

                    // event to display model
                    scope.$on("E_DISPLAY_DASHBOARD_MODAL_SHARE", function(event, subject) {
                        console.log('share-panel', subject);
                        //TODO remove
                        subject._id = subject.id;
                        scope.isDisplayed = true;
                        scope.subject_array = [];
                        scope.subject_array.push(subject);
                        scope.subject = subject;
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
