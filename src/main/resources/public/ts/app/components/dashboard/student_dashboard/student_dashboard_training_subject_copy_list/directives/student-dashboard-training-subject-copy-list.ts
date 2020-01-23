import { ng } from 'entcore';

export const studentDashboardTrainingSubjectCopyList = ng.directive('studentDashboardTrainingSubjectCopyList',
    ['DateService', 'SubjectCopyService', 'SubjectScheduledService', '$location',
        (DateService, SubjectCopyService, SubjectScheduledService, $location) => {
            return {
                restrict: 'E',
                scope: {
                },
                templateUrl: 'exercizer/public/ts/app/components/dashboard/student_dashboard/student_dashboard_training_subject_copy_list/templates/student-dashboard-training-subject-copy-list.html',
                link: (scope:any) => {

                    // Subject data
                    scope.subjectCopyList = SubjectCopyService.getList();

                    //search
                    if(!scope.search){
                        scope.search = {
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
