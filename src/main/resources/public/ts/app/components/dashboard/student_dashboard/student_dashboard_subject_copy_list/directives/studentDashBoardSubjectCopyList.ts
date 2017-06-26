import { ng } from 'entcore';
import { moment } from 'entcore/libs/moment/moment';

export const studentDashboardSubjectCopyList = ng.directive('studentDashboardSubjectCopyList',
    ['DateService', 'SubjectCopyService', 'SubjectScheduledService', '$location',
        (DateService, SubjectCopyService, SubjectScheduledService, $location) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/ts/app/components/dashboard/student_dashboard/student_dashboard_subject_copy_list/templates/student-dashboard-subject-copy-list.html',
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
                    scope.dateInAWeek = moment().startOf('week').add(1, 'week').toDate();
                    scope.dateInAYears = moment().add(1, 'year').toDate();

                    // Search
                    if (!scope.search) {
                        scope.search = {
                            beginDate: moment().startOf('week').add(1, 'week').toDate(),
                            endDate: moment().add(3, 'month').toDate()
                        }
                    }
                }
            }
        }
    ]
);
