import { ng } from 'entcore';

export const studentDashboardFinishSubjectCopyList = ng.directive('studentDashboardFinishSubjectCopyList',
    ['DateService', 'SubjectCopyService', 'SubjectScheduledService', '$location',
        (DateService, SubjectCopyService, SubjectScheduledService, $location) => {
            return {
                restrict: 'E',
                scope: {
                },
                templateUrl: 'exercizer/public/ts/app/components/dashboard/student_dashboard/student_dashboard_finish_subject_copy_list/templates/student-dashboard-finish-subject-copy-list.html',
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
                            filter : []
                        };
                    }

                    scope.clickFilter = function(filter){
                        var filterIndex = scope.search.filter.indexOf(filter);
                        if (filterIndex === -1) {
                            scope.search.filter.push(filter);
                        } else {
                            scope.search.filter.splice(filterIndex, 1);
                        }
                    };

                    scope.filerIsSelected = function(filter){
                        return scope.search.filter.indexOf(filter) !== -1 ? 'selected' : '';
                    };
                }
            }
        }
    ]
);
