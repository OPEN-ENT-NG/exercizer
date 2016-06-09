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

                        // subject data
                        scope.subjectCopyList = SubjectCopyService.getList();
                        // date data
                        scope.today = new Date();
                        scope.yesterday = DateService.addDays(scope.today, -1);
                        //search
                        if(!scope.search){
                            scope.search = {};
                        }
                        // specific
                        scope.search.endDate = scope.yesterday;
                        scope.search.beginDate = undefined;


                        scope.filterOnSubjectScheduledState = function(corrected, givenBack, pending){
                            return function(subjectCopy){
                                if(corrected || givenBack || pending){
                                    var res = true;
                                    if(corrected && res){
                                        res = subjectCopy.is_corrected;
                                    }
                                    if(givenBack && res){
                                        res = subjectCopy.submitted_date
                                    }
                                    if(pending && res){
                                        res = subjectCopy.is_correction_on_going
                                    }
                                    return res;
                                } else{
                                    return true;
                                }
                            }
                        };

                        scope.filterOnSubjectScheduledTitle = function(text) {
                            return function( subjectCopy ) {
                                var subjectScheduled = scope.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
                                if(text){
                                    if(subjectScheduled.title.toLowerCase().search(text.toLowerCase()) === -1){
                                        return false;
                                    } else {
                                        return true;
                                    }
                                } else{
                                    return true;
                                }
                            };
                        };

                        scope.filterOnSubjectScheduledDueDate = function(begin, end){
                            return function (subjectCopy){
                                var subjectScheduled = scope.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
                                var dueDate = DateService.timestampToDate(subjectScheduled.due_date);
                                if(!end){
                                    end = scope.yesterday;
                                }
                                if(!begin){
                                    return DateService.compare_after(end, dueDate);
                                }
                                return DateService.compare_after(dueDate,begin) && DateService.compare_after(end,dueDate);
                            }
                        };

                        scope.orderBySubjectScheduledDueDate = function(subjectCopy){
                            var subjectScheduled = scope.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
                            return subjectScheduled.due_date;
                        };


                        scope.getSubjectScheduledById = function(id : number){
                            return SubjectScheduledService.listMappedById[id];
                        };


                    }
                }
            }
        ]
    }
);
