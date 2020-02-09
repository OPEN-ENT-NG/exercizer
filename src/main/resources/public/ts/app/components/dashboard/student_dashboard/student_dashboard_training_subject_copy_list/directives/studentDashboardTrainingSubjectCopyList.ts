import { ng, moment } from 'entcore';

export const studentDashboardTrainingSubjectCopyList = ng.directive('studentDashboardTrainingSubjectCopyList',
    ['DateService', 'SubjectCopyService', 'SubjectScheduledService', '$location',
        (DateService, SubjectCopyService, SubjectScheduledService, $location) => {
            return {
                restrict: 'E',
                scope: {
                },
                templateUrl: 'exercizer/public/ts/app/components/dashboard/student_dashboard/student_dashboard_training_subject_copy_list/templates/student-dashboard-training-subject-copy-list.html',
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

                    function subjectTrainingTypeIndicator(subjectCopy) {
                        if (subjectCopy.has_been_started) {
                            return 3; // 'is_on_going';
                        } else if (subjectCopy.submitted_date) {
                            return 2; // 'is_done';
                        } else {
                            return 1; // 'is_sided';
                        }
                    };

                    scope.subjectTrainingComparator = function(subjectCopy) {
                        var indicator = subjectTrainingTypeIndicator(subjectCopy);
                        return indicator * moment(subjectCopy.modified).unix();
                    };

                    scope.getEmptyScreen = function() {
                        if (scope.search.filter.length != 1) {
                            return 'is_on_going';
                        }
                        return scope.search.filter[0];
                    }
                }
            }
        }
    ]
);
