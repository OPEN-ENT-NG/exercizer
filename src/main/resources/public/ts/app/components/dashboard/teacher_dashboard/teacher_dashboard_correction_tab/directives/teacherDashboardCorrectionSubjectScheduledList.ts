import { ng, skin, idiom, notify } from 'entcore';
import { moment } from 'entcore';
import { ISubjectScheduled, Subject } from '../../../../../models/domain';

export const teacherDashboardCorrectionSubjectScheduledList = ng.directive('teacherDashboardCorrectionSubjectScheduledList', 
    ['SubjectScheduledService', 'SubjectService', 'GroupService','DateService','SubjectCopyService','$location','$route', 
    (SubjectScheduledService, SubjectService, GroupService, DateService,SubjectCopyService, $location, $route) => {
        return {
            restrict: 'E',
            scope: {
                selectedSubjectScheduled : "="
            },
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/templates/teacher-dashboard-correction-subject-scheduled-list.html',
            link: (scope:any) => {

                /**
                 * INIT
                 */

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
                
                load();

                /**
                 * LOAD
                 */
                function load() {
                    scope.subjectScheduledList = [];
                    scope.selectedSubjectsScheduled=[];

                    scope.toggle = {
                        show: false,
                        showExport : false,
                        showUnScheduled : false
                    };

                    scope.lightbox = {
                        isDisplayed: false
                    };

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
                                var subjectId = (<ISubjectScheduled>scope.subjectScheduledList[0]).subject_id;
                                SubjectService.getByIdEvenDeleted(subjectId).then(
                                    function (data) {
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
                };

                function createListAutoComplete(subjectScheduledList) {
                    var array = [];
                    angular.forEach(subjectScheduledList, function (subjectScheduled) {
                        subjectScheduled.selected = false;
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
                    return subjectScheduled.picture || skin.basePath + 'img/illustrations/image-default.svg';
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
                        return idiom.translate("exercizer.copy.state.corrected");
                    } else{
                        return idiom.translate("exercizer.copy.state.notcorrected");
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
                    return scope.search.filter.indexOf(filter) !== -1 ? 'selected' : '';
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
                    var lastUpdateCopy:any;
                    angular.forEach(copyList, function(copy){
                        if(lastUpdateCopy){
                            if(DateService.compare_after(DateService.isoToDate(copy.modified), DateService.isoToDate(lastUpdateCopy))){
                                lastUpdateCopy = copy;
                            }
                        } else{
                            lastUpdateCopy = copy;
                        }
                    });
                    if(lastUpdateCopy != null && lastUpdateCopy.modified != null){
                        return lastUpdateCopy.modified;
                    }
                }

                scope.selectsubjectScheduled = function(subjectScheduled) {
                    var selectedIndex = scope.selectedSubjectsScheduled.indexOf(subjectScheduled);
                    if (selectedIndex === -1) {
                        scope.selectedSubjectsScheduled.push(subjectScheduled);
                    } else {
                        scope.selectedSubjectsScheduled.splice(selectedIndex, 1);
                    }

                    showToggle();
                };

                scope.exportSelected = function(){
                    exportCSV(scope.selectedSubjectsScheduled);
                }

                function exportCSV(subjects:ISubjectScheduled[]) {
                    var ids:string = "?"
                    subjects.forEach((subject) =>{
                        ids = ids.concat("id="+subject.id+"&");
                    } );
                    window.location.href = '/exercizer/archive/subjects-scheduled/export-csv' + ids.slice(0,-1);
                }

                scope.unScheduled = function() {
                    SubjectScheduledService.unScheduled(scope.selectedSubjectsScheduled[0]).then(function () {
                        load();
                        notify.info("exercizer.service.unschedule");                        
                    }, function (err) {
                        scope.scheduleSubjectInProgress = false;
                        notify.error(err);
                    });
                };

                function showToggle() {
                    if (scope.selectedSubjectsScheduled.length > 1) {
                        scope.toggle.showUnScheduled = false;
                        var isSimple = false;
                        angular.forEach(scope.selectedSubjectsScheduled, function(subject){
                            if(subject.type === 'simple'){
                                isSimple = true;
                            }
                        });
                        scope.toggle.show = !isSimple;
                        scope.toggle.showExport = !isSimple;                        
                    } else if (scope.selectedSubjectsScheduled.length === 1) {
                        scope.toggle.show = true;
                        scope.toggle.showExport = scope.selectedSubjectsScheduled[0].type !== 'simple';
                        scope.toggle.showUnScheduled = true;
                    } else {
                        scope.toggle.show = false;                      
                    }
                };
            }
        };
}]);
