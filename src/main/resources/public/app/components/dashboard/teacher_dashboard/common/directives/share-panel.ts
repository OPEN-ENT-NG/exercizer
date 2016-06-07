directives.push(
    {
        name: 'sharePanel',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/common/templates/share-panel.html',
                link: (scope:any, element, attrs) => {

                    scope.isDisplayed = false;
                    scope.subject = null;

                    // event to display model
                    scope.$on("E_DISPLAY_DASHBOARD_MODAL_SHARE", function(event, subject) {
                        console.log('E_DISPLAY_DASHBOARD_MODAL_SHARE');
                        scope.isDisplayed = true;
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
