directives.push(
    {
        name: 'studentDashboardFinishSubjectCopyList',
        injections: ['DateService', 'SubjectCopyService', 'SubjectScheduledService', '$location',
            (DateService, SubjectCopyService, SubjectScheduledService, $location) => {
                return {
                    restrict: 'E',
                    scope: {
                    },
                    templateUrl: 'exercizer/public/app/components/dashboard/student_dashboard/student_dashboard_finish_subject_copy_list/templates/student-dashboard-finish-subject-copy-list.html',
                    link: (scope:any) => {

                        // Subject data
                        scope.subjectCopyList = SubjectCopyService.getList();

                        // Date data
                        scope.today = new Date();
                        scope.yesterday = DateService.addDays(scope.today, -1);
                        scope.dateAYearsAgo = DateService.addDays(scope.today, -354);
                        //search
                        if(!scope.search){
                            scope.search = {
                                endDate : scope.yesterday,
                                beginDate : scope.dateAYearsAgo,
                                filter : null
                            };
                        }
                    }
                }
            }
        ]
    }
);
