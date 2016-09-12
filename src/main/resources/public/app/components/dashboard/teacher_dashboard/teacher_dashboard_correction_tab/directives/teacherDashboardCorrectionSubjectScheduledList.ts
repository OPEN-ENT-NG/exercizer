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
                    scope.dateAYearshAgo = moment().subtract('month', 1).toDate();
                    scope.dateInAYears = moment().add('month', 3).toDate();
                    scope.search = {
                        groupList: [],
                        beginDate : scope.dateAYearshAgo,
                        endDate : scope.dateInAYears,
                        filter: []
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
                                scope.autocomplete = {
                                    groupList: createListAutoComplete(scope.subjectScheduledList)
                                };
                                var subjectId = scope.subjectScheduledList[0].subject_id;
                                SubjectService.getByIdEvenDeleted(subjectId).then(
                                    function(data){
                                        var subject = data;
                                        if (subject instanceof Subject) {
                                            /*GroupService.getList(subject).then(
                                                function (data) {
                                                    scope.autocomplete = {
                                                        groupList: createListAutoComplete(data.groups.visibles)
                                                    }
                                                }
                                            )*/
                                        } else {
                                            console.error(subject, 'is not an instance of Subject');
                                            throw "";
                                        }
                                    }
                                );
                            }
                        }
                    );

                    function createListAutoComplete(subjectScheduledList) {
                        var array = [];
                        angular.forEach(subjectScheduledList, function (subjectScheduled) {
                            angular.forEach(subjectScheduled.scheduled_at.groupList, function(group){
                                var obj = {
                                    name: group.name,
                                    id: group._id,
                                    toString: function () {
                                        return this.name;
                                    }
                                };
                                var isSet = false;
                                angular.forEach(array, function(alreadySet){
                                    if(obj.id == alreadySet.id){
                                        isSet = true;
                                    }
                                });
                                if(isSet === false){
                                    array.push(obj);
                                }
                            })

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
                        if(scope.search.groupList.indexOf(selectedItem) != -1){
                            scope.search.groupList.splice(scope.search.groupList.indexOf(selectedItem), 1);
                        } else{
                            scope.search.groupList.push(selectedItem);
                        }
                    };

                    scope.isGroupSelected = function(item){
                        if(scope.search.groupList.indexOf(item) != -1){
                            return 'custom-selected'
                        }
                    };

                    scope.clickFilter = function (filter) {
                        var filterIndex = scope.search.filter.indexOf(filter);
                        if (filterIndex === -1) {
                            scope.search.filter.push(filter);
                        } else {
                            scope.search.filter.splice(filterIndex, 1);
                        }
                    };

                    scope.clickOnSubjectScheduled = function(subjectScheduled){
                        scope.selectedSubjectScheduled = subjectScheduled;
                        $location.path('/dashboard/teacher/correction/'+subjectScheduled.id);
                    };

                    /**
                     * DISPLAY
                     */

                    scope.filerIsSelected = function(filter){
                        return scope.search.filter.indexOf(filter) !== -1 ? 'custom-selected' : '';
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
                    scope.filterOnGroupSelected = function (groupSelectedList) {
                        return function (subjectScheduled) {
                            if (!groupSelectedList || groupSelectedList.length == 0) {

                                return true;
                            } else {
                                var res = false;
                                angular.forEach(subjectScheduled.scheduled_at.groupList, function (group) {
                                    angular.forEach(groupSelectedList, function(groupSelected){
                                        if (group._id == groupSelected.id) {
                                            res = true
                                        }
                                    });

                                });
                                return res;

                            }
                        }
                    };

                    scope.seeAllAssignAtList = function(subjectScheduled){
                        scope.$emit('E_SEE_SUBJECT_SCHEDULED_ASSIGN_AT', {subjectScheduled : subjectScheduled});
                    };

                    scope.filterOnGroupSelectedState = function(){
                        return function (subjectScheduled) {

                            if (scope.search.filter.length === 0 || (scope.search.filter.indexOf('corrected') !== -1 && scope.search.filter.indexOf('notCorrected') !== -1)) {
                                return true;
                            } else {
                                var list = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);

                                if (scope.search.filter.indexOf('corrected') !== -1) {
                                    return isListCopyCorrected(list);
                                }

                                return !isListCopyCorrected(list);
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
