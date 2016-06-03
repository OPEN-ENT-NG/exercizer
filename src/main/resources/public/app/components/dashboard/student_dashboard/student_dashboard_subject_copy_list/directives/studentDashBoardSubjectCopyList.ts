directives.push(
    {
        name: 'studentDashboardSubjectCopyList',
        injections: ['DateService', 'FolderService', 'DragService', '$location',
            (DateService, FolderService, DragService, $location) => {
                return {
                    restrict: 'E',
                    scope: {
                    },
                    templateUrl: 'exercizer/public/app/components/dashboard/student_dashboard/student_dashboard_subject_copy_list/templates/student-dashboard-subject-copy-list.html',
                    link: (scope:any) => {

                        scope.today = new Date();
                        scope.dateInAWeek = DateService.addDays(scope.today, 7);
                        //init
                        if(!scope.search){
                            scope.search = {};
                        }
                        scope.search.beginDate = scope.dateInAWeek;


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
                                if(!begin){
                                    begin = scope.dateInAWeek;
                                }
                                if(!end){
                                    return DateService.compare_after(dueDate,begin);
                                }
                                return DateService.compare_after(dueDate,begin) && DateService.compare_after(end,dueDate);
                            }
                        };

                        scope.orderBySubjectScheduledDueDate = function(subjectCopy){
                            var subjectScheduled = scope.getSubjectScheduledById(subjectCopy.subject_scheduled_id);
                            return subjectScheduled.due_date;
                        };


                        scope.getSubjectScheduledById = function(id : number){
                            if(!scope.subjectScheduledList[id]){
                                throw "subject scheduled missing";
                            }
                            return scope.subjectScheduledList[id];
                        };

                        var dataSubjectCopy = [
                            {
                                "id": "57516cf3747c0beeb0e4935f",
                                "subject_scheduled_id": "1",
                                "owner": "Margery",
                                "created": "1464968639",
                                "modified": "1464968639",
                                "final_score": null,
                                "calculated_score": null,
                                "comment": null,
                                "has_been_started": false,
                                "submitted_date": "1464968639",
                                "is_correction_on_going": false,
                                "is_corrected": false,
                                "is_deleted": false
                            },
                            {
                                "id": "57516cf30e4c380f559f236e",
                                "subject_scheduled_id": "2",
                                "owner": "Buckner",
                                "created": "1464968639",
                                "modified": "1464968639",
                                "final_score": null,
                                "calculated_score": null,
                                "comment": null,
                                "has_been_started": false,
                                "submitted_date": "1464968639",
                                "is_correction_on_going": false,
                                "is_corrected": false,
                                "is_deleted": false
                            },
                            {
                                "id": "57516cf319b958f7292ff510",
                                "subject_scheduled_id": "3",
                                "owner": "Kidd",
                                "created": "1464968639",
                                "modified": "1464968639",
                                "final_score": null,
                                "calculated_score": null,
                                "comment": null,
                                "has_been_started": true,
                                "submitted_date": "1464968639",
                                "is_correction_on_going": false,
                                "is_corrected": false,
                                "is_deleted": false
                            }
                        ];

                        var dataSubjectScheduled = {

                            1: {
                                "id": "1",
                                "subject_id": "57516f008a8bc277ed1b0168",
                                "owner": "Bettie",
                                "created": "Mon Jun 09 1997 11:46:54 GMT+0000 (UTC)",
                                "title": "California",
                                "description": "Consequat et adipisicing nulla reprehenderit.",
                                "picture": "https://i.ytimg.com/vi/gMadZ5PraLo/hqdefault.jpg",
                                "max_score": 30,
                                "begin_date": "1464968639",
                                "due_date": "1467649548",
                                "estimated_duration": "15",
                                "is_over": false,
                                "is_one_shot_submit": false,
                                "is_deleted": false
                            },
                            2: {
                                "id": "2",
                                "subject_id": "57516f00f234eb90a7a72a6d",
                                "owner": "Sanchez",
                                "created": "Sat Jan 12 2008 05:55:12 GMT+0000 (UTC)",
                                "title": "Louisiana",
                                "description": "Voluptate laborum commodo sint ex labore do ut aute exercitation proident officia.",
                                "picture": "https://i.ytimg.com/vi/gMadZ5PraLo/hqdefault.jpg",
                                "max_score": 25,
                                "begin_date": "1464968639",
                                "due_date": "1451924748",
                                "estimated_duration": "30",
                                "is_over": false,
                                "is_one_shot_submit": false,
                                "is_deleted": false
                            },
                            3: {
                                "id": "3",
                                "subject_id": "57516f00b0fba133ba70e20a",
                                "owner": "Burke",
                                "created": "Wed Jan 07 2009 09:51:53 GMT+0000 (UTC)",
                                "title": "Montana",
                                "description": "Dolore id sunt sit elit tempor cillum nisi cillum nulla officia aliquip do ut.",
                                "picture": "https://i.ytimg.com/vi/gMadZ5PraLo/hqdefault.jpg",
                                "max_score": 10,
                                "begin_date": "1464968639",
                                "due_date": "1465057548",
                                "estimated_duration": "60",
                                "is_over": false,
                                "is_one_shot_submit": false,
                                "is_deleted": false
                            }
                        };

                        scope.subjectCopyList = dataSubjectCopy;
                        scope.subjectScheduledList = dataSubjectScheduled;
                    }
                }
            }
        ]
    }
);
