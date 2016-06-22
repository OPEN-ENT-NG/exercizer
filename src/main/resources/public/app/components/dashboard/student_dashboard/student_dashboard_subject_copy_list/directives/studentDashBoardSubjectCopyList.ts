directives.push(
    {
        name: 'studentDashboardSubjectCopyList',
        injections: ['DateService', 'SubjectCopyService', 'SubjectScheduledService', '$location',
            (DateService, SubjectCopyService, SubjectScheduledService, $location) => {
                return {
                    restrict: 'E',
                    scope: {},
                    templateUrl: 'exercizer/public/app/components/dashboard/student_dashboard/student_dashboard_subject_copy_list/templates/student-dashboard-subject-copy-list.html',
                    link: (scope:any) => {

                        // Get data
                        scope.subjectCopyList = [];
                        SubjectCopyService.resolve(false).then(
                            function () {
                                scope.subjectCopyList = SubjectCopyService.getList();
                            }
                        );
                        SubjectScheduledService.resolve(false).then(
                            function(){
                            }
                        );

                        // Date
                        scope.today = new Date();
                        scope.dateInAWeek = DateService.addDays(scope.today, 8);
                        scope.dateInAYears = DateService.addDays(scope.today, 354);

                        // Search
                        if (!scope.search) {
                            scope.search = {
                                beginDate : scope.dateInAWeek,
                                endDate : scope.dateInAYears
                            }
                        }
                    }
                }
            }
        ]
    }
);
