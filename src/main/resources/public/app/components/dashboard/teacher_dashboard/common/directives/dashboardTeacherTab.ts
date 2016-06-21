directives.push(
    {
        name: 'dashboardTeacherTab',
        injections: [ '$location', '$window', ($location, $window) => {
            return {
                restrict: 'E',
                scope: {
                    currentTab: "="
                },
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/common/templates/dashboard-teacher-tab.html',
                link: (scope:any, element, attrs) => {

                    scope.switchTab = function (newTab) {
                        switch (newTab){
                            case 'mySubjects':
                                $location.path('/dashboard');
                                break;
                            case 'correction':
                                $location.path('/dashboard/teacher/correction/');
                                break;
                            case 'library':
                                $location.path('/dashboard');
                                break;
                            default :
                                throw "tab "+newTab+"  missing"
                        }
                    };

                    scope.switchToStudentView = function () {
                        $location.path('/dashboard/student');
                        $window.location.reload();
                    }

                }
            };
        }]
    }
);
