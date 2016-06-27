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
                        var today = new Date();
                        scope.dateInAYears = DateService.addDays(today, 354);
                        scope.dateAYearsAgo = DateService.addDays(today, -354);
                        //search
                        if(!scope.search){
                            scope.search = {
                                endDate : scope.dateInAYears,
                                beginDate : scope.dateAYearsAgo,
                                filter : null
                            };
                        }

                        scope.clickFilter = function(filter){
                            if(scope.search.filter == filter){
                                scope.search.filter = null
                            } else{
                                scope.search.filter = filter
                            }
                        };

                        scope.filerIsSelected = function(filter_a, filter_b){
                            if(filter_a === filter_b){
                                return 'custom-selected'
                            }
                        };
                    }
                }
            }
        ]
    }
);
