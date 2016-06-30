directives.push(
    {
        name: 'dashboardTeacherTab',
        injections: [ '$location', '$window', 'SubjectService', ($location, $window, SubjectService:ISubjectService) => {
            return {
                restrict: 'E',
                scope: {
                    currentTab: "=",
                    selectedSubjectScheduled : "="
                },
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/common/templates/dashboard-teacher-tab.html',
                link: (scope:any) => {

                    scope.switchTab = function (newTab) {
                        switch (newTab){
                            case 'mySubjects':
                                SubjectService.resolve(true).then(
                                    function(){
                                        $location.path('/dashboard');
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                );

                                break;
                            case 'correction':
                                $location.path('/dashboard/teacher/correction/');
                                break;
                            case 'library':
                                $location.path('/dashboard/teacher/library');
                                break;
                            default:
                                throw 'tab ' + newTab + ' missing'
                        }
                    };

                    scope.switchToStudentView = function () {
                        $location.path('/dashboard/student');
                        setTimeout(
                            function(){
                                $window.location.reload();
                            },
                            1);
                    };

                    scope.clickReturnExercizer = function(){
                        switch (scope.currentTab){
                            case 'mySubjects':
                                break;
                            case 'correction':
                                scope.selectedSubjectScheduled = null;
                                $location.path('/dashboard');
                                break;
                            case 'library':
                                scope.selectedSubjectScheduled = null;
                                $location.path('/dashboard');
                                break;
                            default :
                                throw "tab "+scope.currentTab+"  missing"
                        }

                    };

                    scope.clickReturnExercizerTab = function(){
                        switch (scope.currentTab){
                            case 'mySubjects':
                                break;
                            case 'correction':
                                scope.selectedSubjectScheduled = null;
                                $location.path('/dashboard/teacher/correction');
                                break;
                            case 'library':
                                break;
                            default :
                                throw "tab "+scope.currentTab+"  missing"
                        }

                    };

                    scope.getTab = function(){
                        switch (scope.currentTab){
                            case 'mySubjects':
                                return "Mes sujets";
                            case 'correction':
                                return "Correction";
                            case 'library':
                                return "Bibliothèque";
                            default :
                                throw "tab "+scope.currentTab+"  missing"
                        }
                    };

                    scope.getSubjectSelectedTitle = function(){
                        if(scope.selectedSubjectScheduled){
                            return scope.selectedSubjectScheduled.title
                        }
                    }
                }
            };
        }]
    }
);
