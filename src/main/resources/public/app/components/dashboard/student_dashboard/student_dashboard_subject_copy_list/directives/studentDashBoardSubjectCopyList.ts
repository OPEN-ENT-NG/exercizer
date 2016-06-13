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

                        // subject data
                        scope.subjectCopyList = [];
                        SubjectCopyService.resolve(false).then(
                            function () {
                                scope.subjectCopyList = SubjectCopyService.getList();
                            }
                        );
                        SubjectScheduledService.resolve(false).then(
                            function(){
                                //scope.$apply();
                            }
                        );

                        // date data
                        scope.today = new Date();
                        scope.dateInAWeek = DateService.addDays(scope.today, 7);
                        // search
                        if (!scope.search) {
                            scope.search = {};
                        }
                        // specific
                        scope.search.beginDate = scope.dateInAWeek;
                        scope.search.endDate = undefined;


                        scope.filterOnSubjectScheduledTitle = function (text) {
                            return function (subjectCopy) {
                                var subjectScheduled = scope.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
                                if (subjectScheduled) {
                                    if (text) {
                                        if (subjectScheduled.title.toLowerCase().search(text.toLowerCase()) === -1) {
                                            return false;
                                        } else {
                                            return true;
                                        }
                                    } else {
                                        return true;
                                    }
                                } else {
                                    return true;
                                }

                            };
                        };

                        scope.filterOnSubjectScheduledDueDate = function (begin, end) {
                            return function (subjectCopy) {
                                var subjectScheduled = scope.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
                                if (subjectScheduled) {
                                    var dueDate = DateService.timestampToDate(subjectScheduled.due_date);
                                    if (!begin) {
                                        begin = scope.dateInAWeek;
                                    }
                                    if (!end) {
                                        return DateService.compare_after(dueDate, begin)
                                    }
                                    return DateService.compare_after(dueDate, begin) && DateService.compare_after(end, dueDate);
                                } else {
                                    return false;
                                }

                            }
                        };

                        scope.orderBySubjectScheduledDueDate = function (subjectCopy) {
                            var subjectScheduled = scope.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
                            if (subjectScheduled) {
                                return subjectScheduled.due_date;
                            } else {
                                return null;
                            }
                        };

                        scope.getSubjectScheduledById = function (id:number) {
                            return SubjectScheduledService.listMappedById[id];
                        };
                    }
                }
            }
        ]
    }
);
