directives.push(
    {
        name: 'teacherDashboardCorrectionSubjectScheduledList',
        injections: ['SubjectScheduledService', 'SubjectService', 'GroupService','DateService','SubjectCopyService','$location','$route', (SubjectScheduledService, SubjectService, GroupService, DateService,SubjectCopyService, $location, $route) => {
            return {
                restrict: 'E',
                scope: {
                    selectedSubjectScheduled : "="
                },
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/templates/teacher-dashboard-correction-subject-scheduled-list.html',
                link: (scope:any) => {

                    /**
                     * INIT
                     */
                    scope.subjectScheduledList = [];
                    // Date data
                    scope.today = new Date();
                    scope.dateAYearshAgo = DateService.addDays(scope.today, -365);
                    scope.dateInAYears = DateService.addDays(scope.today, 365);
                    scope.search = {
                        beginDate : scope.dateAYearshAgo,
                        endDate : scope.dateInAYears
                    };

                    /**
                     * LOAD
                     */
                    // load subject scheduled
                    // revolve true means teacher
                    SubjectScheduledService.resolve(true).then(
                        function () {
                            scope.subjectScheduledList = SubjectScheduledService.getList();
                            if (scope.subjectScheduledList.length !== 0) {
                                // get auto complete
                                var subjectId = scope.subjectScheduledList[0].subject_id;
                                SubjectService.getByIdEvenDeleted(subjectId).then(
                                    function(data){
                                        var subject = data;
                                        if (subject instanceof Subject) {
                                            GroupService.getClassFromStructures(model.me.structures).then(
                                                function(data){
                                                    //console.log(data);
                                                }
                                            );
                                            GroupService.getList(subject).then(
                                                function (data) {
                                                    scope.autocomplete = {
                                                        groupList: createListAutoComplete(data.groups.visibles)
                                                    }
                                                }
                                            )
                                        } else {
                                            console.error(subject, 'is not an instance of Subject');
                                            throw "";
                                        }
                                    }
                                );
                            }
                        }
                    );

                    function createListAutoComplete(list) {
                        var array = [];
                        angular.forEach(list, function (value) {
                            var obj = {
                                name: value.name,
                                id: value.id,
                                toString: function () {
                                    return this.name;
                                }
                            };
                            array.push(obj);
                        });
                        return array;
                    }

                    /**
                     * GET subject Scheduled information
                     */
                    scope.getSubjectScheduledPicture = function (subjectScheduled) {
                        return subjectScheduled.picture || '/assets/themes/leo/img/illustrations/poll-default.png';
                    };

                    scope.numberOfCopySubmitted = function (subjectScheduled){
                        var list = SubjectCopyService.getListBySubjectScheduled(subjectScheduled),
                            res = 0;
                        angular.forEach(list, function(copy){
                           if(copy.submitted_date){
                               res++
                           }
                        });
                        return res;
                    };

                    scope.numberOfCopy = function (subjectScheduled){
                        var list = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
                        return list.length;
                    };

                    function isListCopyCorrected(list){
                        if(list){
                            var res = true;
                            angular.forEach(list, function(copy){
                                if(!copy.is_corrected){
                                    res = false
                                }
                            });
                            return res;
                        } else{
                            return false;
                        }
                    }

                    scope.stateTextSubjectScheduled = function(subjectScheduled){
                        var list = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
                        if(isListCopyCorrected(list)){
                            return "Corrigé";
                        } else{
                            return "Non corrigé";
                        }
                    };

                    scope.stateSubjectScheduled = function(subjectScheduled){
                        var list = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
                        if(isListCopyCorrected(list)){
                            return "is_corrected";
                        } else{
                            return "is_not_corrected";
                        }
                    };

                    /**
                     * EVENT
                     */

                    // autocomplete
                    scope.clickOnItem = function (selectedItem) {
                        scope.search.groupSelected = selectedItem;
                    };

                    scope.resetGroupSelected = function () {
                        scope.search.groupSelected = null;
                    };

                    scope.clickFilter = function (filter) {
                        scope.search.filter = scope.search.filter == filter ? null : filter;
                    };

                    scope.clickOnSubjectScheduled = function(subjectScheduled){
                        scope.selectedSubjectScheduled = subjectScheduled;
                        $location.path('/dashboard/teacher/correction/'+subjectScheduled.id);
                    };

                    /**
                     * DISPLAY
                     */

                    scope.filerIsSelected = function(filter_a, filter_b){
                        if(filter_a === filter_b){
                            return 'custom-selected'
                        }
                    };

                    /**
                     * FILTER ANGULAR
                     */

                    scope.filterOnSubjectScheduledDueDate = function (begin, end) {
                        return function (subjectScheduled) {
                            var dueDate = DateService.isoToDate(subjectScheduled.due_date);
                            if (!begin || !end) {
                                throw "begin or end date in params missing"
                            }
                            return DateService.compare_after(dueDate, begin, true) && DateService.compare_after(end, dueDate, true);
                        }
                    };
                    scope.filterOnGroupSelected = function (groupSelected) {
                        return function (subjectScheduled) {
                            if (!groupSelected) {
                                return true;
                            } else {
                                var res = false;
                                angular.forEach(subjectScheduled.scheduled_at.groupList, function (group) {
                                    if (group._id == groupSelected.id) {
                                        res = true
                                    }
                                });
                                return res;

                            }
                        }
                    };

                    scope.filterOnGroupSelectedState = function(filter){
                        return function (subjectScheduled){
                            if(!filter){
                                return true;
                            } else{
                                var list = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
                                if(filter == 'corrected'){
                                    return isListCopyCorrected(list);
                                } else if(filter == 'notCorrected'){
                                    return !isListCopyCorrected(list);
                                } else{
                                    throw "filter unknown"
                                }
                            }
                        }
                    };

                    scope.orderByCopyListModificationDate = function(subjectScheduled){
                        var copyList = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
                        var lastUpdateCopy = null;
                        angular.forEach(copyList, function(copy){
                            if(lastUpdateCopy){
                                if(DateService.compare_after(DateService.isoToDate(copy.modified), DateService.isoToDate(lastUpdateCopy))){
                                    lastUpdateCopy = copy;
                                }
                            } else{
                                lastUpdateCopy = copy;
                            }
                        });
                        if(lastUpdateCopy !== null){
                            return lastUpdateCopy.modified;
                        }
                    }
                }
            };
        }]
    }
);
