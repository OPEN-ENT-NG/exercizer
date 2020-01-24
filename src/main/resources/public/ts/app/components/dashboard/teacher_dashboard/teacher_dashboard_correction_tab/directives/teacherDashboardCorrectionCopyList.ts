import { ng, notify } from 'entcore';
import { moment } from 'entcore';
import { _ } from 'entcore';

export const teacherDashboardCorrectionCopyList = ng.directive('teacherDashboardCorrectionCopyList',
     ['SubjectCopyService', 'CorrectionService', 'SubjectScheduledService','$location', 'GroupService','DateService','$q', '$filter', (SubjectCopyService, CorrectionService, SubjectScheduledService, $location, GroupService, DateService, $q, $filter) => {
        return {
            restrict: 'E',
            scope: {
                selectedSubjectScheduled : "="
            },
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/templates/teacher-dashboard-correction-copy-list.html',
            link: (scope:any) => {

                scope.$watch('selectedSubjectScheduled', function(newValue, oldValue) {
                    if(scope.selectedSubjectScheduled){
                        init(scope.selectedSubjectScheduled);
                        /**
                         * INIT
                         */
                        scope.subjectCopyList = [];
                        scope.toasterDisplayed = {main: false, exclude: false};
                        scope.search = {};
                        scope.score = {sum:0, nb:0};

                        resetDisplay();

                        scope.order.field = 'owner_username';
                        scope.order.desc = false;
                        scope.option = {
                            begin_date: new Date(scope.selectedSubjectScheduled.begin_date),
                            due_date: new Date(scope.selectedSubjectScheduled.due_date),
                            begin_time: $filter('date')(scope.selectedSubjectScheduled.begin_date, 'HH:mm'),
                            due_time: $filter('date')(scope.selectedSubjectScheduled.due_date, 'HH:mm'),
                        }
                    }
                });                    

                function init(subjectScheduled){
                    SubjectCopyService.resolveBySubjectScheduled_force(subjectScheduled).then(
                        function () {
                            scope.subjectCopyList = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
                            scope.subjectCopyList.forEach(copy => {
                                if(copy.is_corrected){
                                    scope.score.sum += copy.final_score;
                                    scope.score.nb++;
                                }
                            });
                            CorrectionService.automaticCorrection(scope.subjectCopyList, scope.selectedSubjectScheduled);
                        }
                    );

                    let r = _.map(_.union(scope.selectedSubjectScheduled.scheduled_at.userList, scope.selectedSubjectScheduled.scheduled_at.groupList), _.clone);

                    let total = r.length;
                    let current = 1;
                    _.forEach(r, function (obj) {
                        if (total !== current) obj.name = obj.name + ' - ';
                        current++;
                    });

                    scope.lUserGroup = r;
                    scope.selectedSubjectScheduled.lUserGroup = scope.lUserGroup;
                }

                function resetDisplay() {
                    scope.reminderDisplayed = false;
                    scope.excludeDisplayed = false;
                };

                /**
                 * EVENT
                 */

                scope.reminder = function(id){
                    var possible = false;

                    scope.reminderCopies = [];

                    angular.forEach(scope.subjectCopyList, function(copy){
                        if(copy.selected || copy.id === id){
                            if (copy.submitted_date === null) {
                                possible=true;
                                scope.reminderCopies.push(copy);
                            }
                        }
                    });

                    if (!possible) {
                        notify.info("exercizer.service.check.reminder");
                    } else {
                        scope.reminderDisplayed = true;
                    }
                };

                scope.exclude = function(){
                    scope.excludeDisplayed = true;
                };

                scope.selectCopy = function(){
                    var res = false;
                    scope.toasterDisplayed.exclude = true;
                    angular.forEach(scope.subjectCopyList, function(copy){
                        if(copy.selected){
                            res = true;
                            if (copy.submitted_date) {
                                scope.toasterDisplayed.exclude = false;
                                return false;
                            }
                        }
                    });
                    scope.toasterDisplayed.main =  res;
                };

                scope.clickSelectAll = function(selectAll){
                    var count = 0;
                    angular.forEach(scope.subjectCopyList, function(copy){
                        if(!copy.is_corrected){
                            copy.selected = selectAll;
                            count++
                        }
                    });
                    if(count>0){
                        scope.toasterDisplayed.main =  selectAll;
                    }

                    scope.toasterDisplayed.exclude = false;
                };

                scope.clickOnCopy = function(copy){
                    $location.path('/subject/copy/view/'+scope.selectedSubjectScheduled.subject_id +'/'+ copy.id+'/');
                };

                scope.applyAutomaticMark = function(){
                    var promises = [];
                    scope.score = {sum:0, nb:0};
                    angular.forEach(scope.subjectCopyList, function(copy){
                        if(SubjectCopyService.canCorrectACopyAsTeacher(scope.selectedSubjectScheduled, copy) && copy.selected){
                            copy.is_corrected = true;
                            if(!copy.final_score)
                                copy.final_score = copy.calculated_score;
                            promises.push(SubjectCopyService.correct(copy));
                        }
                        if(copy.is_corrected){
                            scope.score.sum += copy.final_score;
                            scope.score.nb++;
                        }
                    });
                    $q.all(promises).then(
                        function(data){
                            angular.forEach(scope.subjectCopyList, function(copy){
                                    copy.selected = false;
                            });
                            scope.toasterDisplayed.main =  false;
                            scope.selectAll = false
                        }
                    );
                };

                scope.unScheduled = function() {
                    SubjectScheduledService.unScheduled(scope.selectedSubjectScheduled).then(function () {
                        notify.info("exercizer.service.unschedule");
                        scope.option.showUnScheduled=false;
                        window.location.reload();
                    }, function (err) {
                        notify.error(err);
                    });
                };

                scope.checkTime = function (time, def) {
                    return time.match("^([01][0-9]|2[0-3]):[0-5][0-9]$") ? time : $filter('date')(def, 'HH:mm');
                }

                scope.forbidTraining = function($event) {
                    scope.selectedSubjectScheduled.is_training_permitted = !scope.selectedSubjectScheduled.is_training_permitted;
                    $event.stopPropagation();
                }

                scope.cancelDatesEditing = function () {
                    scope.option.editedDates = false;
                    scope.option.begin_date = new Date(scope.selectedSubjectScheduled.begin_date);
                    scope.option.due_date = new Date(scope.selectedSubjectScheduled.due_date);
                    scope.option.begin_time = $filter('date')(scope.selectedSubjectScheduled.begin_date, 'HH:mm');
                    scope.option.due_time = $filter('date')(scope.selectedSubjectScheduled.due_date, 'HH:mm');
                }

                scope.modifySchedule = function () {
                    var subjectScheduled = {
                        id:scope.selectedSubjectScheduled.id,
                        begin_date:moment(scope.option.begin_date).hours(14).minutes(0).seconds(0)
                            .toISOString().replace(/T..:../, "T"+scope.option.begin_time),
                        due_date:moment(scope.option.due_date).hours(14).minutes(0).seconds(0)
                            .toISOString().replace(/T..:../, "T"+scope.option.due_time),
                        is_training_permitted: scope.selectedSubjectScheduled.is_training_permitted
                    };
                    SubjectScheduledService.modifySchedule(subjectScheduled).then(
                        function() {
                            window.location.reload();
                        },
                        function(err) {
                            notify.error(err);
                        }
                    );
                }

                scope.seeAllAssignAtList = function(){
                    scope.assignDisplayed=true;
                };

                scope.atLeastOneUnsubmitted = function(){
                    let result: boolean = false;
                    angular.forEach(scope.subjectCopyList, function(copy){
                        if (copy.selected && !copy.submitted_date) {
                            result = true;
                            return;
                        }
                    });
                    return result;
                }

                scope.considerAsSubmitted = function(){
                    angular.forEach(scope.subjectCopyList, function(copy){
                        if (copy.selected && !copy.submitted_date) {
                            SubjectCopyService.submit(copy).then(
                                function() {
                                    window.location.reload();
                                },
                                function(err) {
                                    notify.error(err);
                                }
                            );
                        }
                    });
                }

                /**
                 * DISPLAY
                 */

                scope.selectTitle = function (copy){
                    if(SubjectCopyService.canCorrectACopyAsTeacher(scope.selectedSubjectScheduled, copy)){
                        return 'correction'
                    } else{
                        return 'text'
                    }
                };

                scope.canCorrectACopyAsTeacher = function(copy){
                    return SubjectCopyService.canCorrectACopyAsTeacher(scope.selectedSubjectScheduled, copy);
                };

                scope.copyStateText = function(copy){
                    return SubjectCopyService.copyStateText(copy);
                };

                scope.copyStateColorClass = function(copy){
                    return SubjectCopyService.copyStateColorClass(copy);
                };

                scope.numberCopyNotCorrected = function(){
                    var res = 0;
                    angular.forEach(scope.subjectCopyList, function(copy){
                        if(!copy.is_corrected){
                            res++;
                        }
                    });
                    return res;
                };

                scope.numberCopySubmitted = function(){
                    var res = 0;
                    angular.forEach(scope.subjectCopyList, function(copy){
                        if(copy.submitted_date){
                            scope.option.hasSubmitted = true;
                            res++;
                        }
                        if(copy.has_been_started)
                            scope.option.hasBeenSarted = true;
                    });
                    return res;
                };

                scope.showAutomaticMark = function() {
                    let show = false;
                    let loopAgain = true;
                    angular.forEach(scope.subjectCopyList, function(copy){                      
                        if(copy.selected && loopAgain){
                            if (SubjectCopyService.canCorrectACopyAsTeacher(scope.selectedSubjectScheduled, copy) && !copy.is_corrected) {
                                show = true;
                            } else {
                                show = false;
                                loopAgain = false;;
                            }
                        }
                    });
                    return show;
                };

                scope.showReminder = function(copy) {
                    return !copy.submitted_date;
                };

                scope.tooLate = function(copy){
                    if(copy.submitted_date && scope.selectedSubjectScheduled && scope.selectedSubjectScheduled.due_date){
                        return DateService.compare_after(DateService.isoToDate(copy.submitted_date), DateService.isoToDate(scope.selectedSubjectScheduled.due_date), false);
                    } else{
                        return false;
                    }
                };

                scope.order = {};

                scope.order.order = function(item){
                    if(scope.order.field === 'submitted_date' && item.submitted_date){
                        return moment(item.submitted_date);
                    } else if (scope.order.field === 'state') {
                        let res = scope.copyStateText(item);
                        return (res === '' ? undefined : res);
                    }

                    if(scope.order.field.indexOf('.') >= 0){
                        var splitted_field = scope.order.field.split('.')
                        var sortValue = item
                        for(var i = 0; i < splitted_field.length; i++){
                            sortValue = (typeof sortValue === 'undefined' || sortValue === null) ? undefined : sortValue[splitted_field[i]]
                        }
                        return sortValue
                    } else
                        return (item[scope.order.field]) ? item[scope.order.field] : undefined;
                };

                scope.orderByField = function(fieldName){
                    if(fieldName === scope.order.field){
                        scope.order.desc = !scope.order.desc;
                    }
                    else{
                        scope.order.desc = false;
                        scope.order.field = fieldName;
                    }
                };
            }
        };
    }]
);
