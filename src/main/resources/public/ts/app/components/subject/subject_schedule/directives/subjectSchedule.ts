import { ng, notify, idiom } from 'entcore';
import { moment } from 'entcore';
import { _ } from 'entcore';
import { $ } from 'entcore';
import { IGrain } from '../../../../models/domain';

export const subjectSchedule = ng.directive('subjectSchedule',
    ['GroupService', '$q', 'SubjectScheduledService', 'GrainScheduledService', 'SubjectCopyService', 'GrainCopyService', 'GrainService', 'DateService', '$filter', (GroupService, $q, SubjectScheduledService, GrainScheduledService, SubjectCopyService, GrainCopyService, GrainService, DateService, $filter) => {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'exercizer/public/ts/app/components/subject/subject_schedule/templates/subject-schedule.html',
            link: (scope:any) => {

                /**
                 * INIT
                 */
                scope.subject = null;
                scope.isSimpleSubject = null;
                scope.scheduleSubjectInProgress = false;

                /**
                 * RESET
                 * http://localhost:8090/userbook/visible/users/562-1454432933262
                 */

                function reset() {
                    scope.lightbox = {
                        state: 'assignSubject',
                        isDisplayed : false
                    };
                    scope.data = {};
                    scope.data.groupList = [];
                    scope.data.userList = [];
                    scope.option = {
                        begin_date: new Date(),
                        due_date: DateService.addDays(new Date, 7),
                        corrected_date: DateService.addDays(new Date, 7),
                        begin_time: "00:00",
                        due_time: "23:59",
                        corrected_time: "00:00"
                    };

                    scope.clearSearch();
                }

                /**
                 * EVENT
                 */

                scope.clickOnItem = function (selectedItem) {
                    if (selectedItem.groupOrUser == 'group') {
                        addInList(scope.data.groupList, selectedItem);
                    } else {
                        addInList(scope.data.userList, selectedItem);
                    }
                };
                
                scope.checkTime = function (time, def?) {
                    return !time.match("/([01][0-9]|2[0-3]):[0-5][0-9]/") ? def ? "23:59" : "00:00" : time;
                }

                scope.removeItem = function (selectedItem) {
                    if (selectedItem.groupOrUser == 'group') {
                        removeInList(scope.data.groupList, selectedItem);
                    } else {
                        removeInList(scope.data.userList, selectedItem);
                    }
                };

                scope.scheduleSubject = function () {
                    scope.scheduleSubjectInProgress = true;
                    if (scope.isSimpleSubject) {
                        scheduleSimpleSubject(scope.subject, scope.option, scope.data).then(function () {
                            reset();
                            scope.scheduleSubjectInProgress = false;
                            notify.info("exercizer.service.save.schedule");
                        }, function (err) {
                            scope.scheduleSubjectInProgress = false;
                            notify.error(err);
                        });
                    } else {
                        canSchedule(scope.option, scope.subject).then(function () {
                            scheduleSubject(scope.subject, scope.option, scope.data).then(function () {
                                reset();
                                scope.scheduleSubjectInProgress = false;
                                notify.info("exercizer.service.save.schedule");
                            }, function (err) {
                                scope.scheduleSubjectInProgress = false;
                                notify.error(err);
                            });
                        }, function (err) {
                            scope.scheduleSubjectInProgress = false;
                            notify.error(err);
                        });
                    }
                };

                function canSchedule(option, subject) {
                    var deferred = $q.defer();                                               
                    // shchedule options is correct , now check subject itself
                    GrainService.getListBySubject(subject).then(
                        function (data) {
                            // create grain list scheduled
                            if (data.length == 0) {
                                deferred.reject("exercizer.service.check.schedule");
                            } else {
                                // question : all grain exept statement
                                var validationGrain = true;
                                var numberQuestion = 0;
                                angular.forEach(data, function (grain) {
                                    switch (grain.grain_type_id) {
                                        case 1 :
                                            break;
                                        case 2 :
                                            break;
                                        case 3 :
                                            break;
                                        case 4 :
                                            numberQuestion++;
                                            break;
                                        case 5 :
                                            numberQuestion++;
                                            break;
                                        case 6 :
                                            if (!grain.grain_data.custom_data.correct_answer_list || grain.grain_data.custom_data.correct_answer_list.length === 0) {
                                                validationGrain = false;
                                            }
                                            numberQuestion++;
                                            break;
                                        case 7 :
                                            numberQuestion++;
                                            if (!grain.grain_data.custom_data.correct_answer_list || grain.grain_data.custom_data.correct_answer_list.length === 0) {
                                                validationGrain = false;
                                            } else {
                                                var allFalse = true;
                                                angular.forEach(grain.grain_data.custom_data.correct_answer_list, function (current) {
                                                    if (current.isChecked) {
                                                        allFalse = false;
                                                    }
                                                });
                                                if (allFalse) {
                                                    validationGrain = false;
                                                }
                                            }
                                            break;
                                        case 8 :
                                            numberQuestion++;
                                            if (!grain.grain_data.custom_data.correct_answer_list || grain.grain_data.custom_data.correct_answer_list.length === 0) {
                                                validationGrain = false;
                                            }
                                            break;
                                        case 9 :
                                            numberQuestion++;
                                            if (!grain.grain_data.custom_data.correct_answer_list || grain.grain_data.custom_data.correct_answer_list.length === 0) {
                                                validationGrain = false;
                                            }
                                            break;
                                        default :
                                            numberQuestion++;
                                    }

                                });
                                if (numberQuestion === 0) {
                                    deferred.reject("exercizer.service.check.schedule");
                                } else {
                                    if (validationGrain === true) {
                                        deferred.resolve();
                                    } else {
                                        deferred.reject("exercizer.service.check.schedule.resp");
                                    }
                                }
                            }
                        },
                        function (err) {
                            deferred.reject(err);
                        }
                    );
                        
                    return deferred.promise;
                }

                function scheduleSimpleSubject(subject, option, data) {
                    var deferred = $q.defer(),
                        subjectScheduled = SubjectScheduledService.createFromSubject(subject);
                    subjectScheduled.begin_date = moment(option.begin_date).hours(14).minutes(0).seconds(0)
                        .toISOString().replace(/T..:../, "T"+option.begin_time);
                    subjectScheduled.due_date = moment(option.due_date).hours(14).minutes(0).seconds(0)
                        .toISOString().replace(/T..:../, "T"+option.due_time);
                    subjectScheduled.corrected_date = moment(option.corrected_date).hours(14).minutes(0).seconds(0)
                        .toISOString().replace(/T..:../, "T"+option.corrected_time);
                    subjectScheduled.scheduled_at = createSubjectScheduledAt(data)
                    SubjectScheduledService.simpleSchedule(subjectScheduled).then(
                        function() {
                            SubjectScheduledService.resolve(true);
                            deferred.resolve();
                        },
                        function(err) {
                            deferred.reject(err);
                        }
                    );                            

                    return deferred.promise;
                }

                function scheduleSubject(subject, option, data) {
                    var deferred = $q.defer(),
                        subjectScheduled = SubjectScheduledService.createFromSubject(subject);
                    subjectScheduled.begin_date = moment(option.begin_date).hours(14).minutes(0).seconds(0)
                        .toISOString().replace(/T..:../, "T"+option.begin_time);
                    subjectScheduled.due_date = moment(option.due_date).hours(14).minutes(0).seconds(0)
                        .toISOString().replace(/T..:../, "T"+option.due_time);
                    subjectScheduled.estimated_duration = option.estimated_duration;
                    subjectScheduled.has_automatic_display = option.has_automatic_display;
                    subjectScheduled.is_one_shot_submit = !option.allow_students_to_update_copy;
                    subjectScheduled.scheduled_at = createSubjectScheduledAt(data);

                    GrainService.getListBySubject(subject).then(
                        function (data) {
                            var grainsCustomCopyData = GrainCopyService.createGrainCopyCustomList(data);
                            SubjectScheduledService.schedule(subjectScheduled, grainsCustomCopyData).then(
                                function() {
                                    SubjectScheduledService.resolve(true);
                                    deferred.resolve();
                                },
                                function(err) {
                                    deferred.reject(err);
                                }
                            );
                        },
                        function(err) {
                            deferred.reject(err);
                        }
                    );

                    return deferred.promise;
                }
                
                function createSubjectScheduledAt(data) {
                    if (!data) {
                        throw "data missing";
                    }
                    var res = {
                        groupList: [],
                        userList: []
                    };
                    angular.forEach(data.groupList, function (group) {
                        res.groupList.push({
                            _id: group._id,
                            name: group.title
                        })
                    });
                    angular.forEach(data.userList, function (user) {
                        res.userList.push({
                            _id: user._id,
                            name: user.title
                        })
                    });
                    
                    return res;
                }

                /**
                 * MODAL
                 */

                    // event to display model
                scope.$on("E_DISPLAY_MODAL_SCHEDULE_SUBJECT", function (event, subject) {
                    scope.isSimpleSubject = 'simple' === subject.type;
                    if (!scope.isSimpleSubject) {
                        GrainService.getListBySubject(subject).then(
                            function (grainList:IGrain[]) {
                                if (grainList.length > 0) {
                                    scope.subject = subject;
                                    reset();
                                    scope.lightbox.isDisplayed = true;
                                    scope.data.lists = createLists(subject);
                                } else {
                                    notify.info('exercizer.service.check.schedule');
                                }
                            },
                            function (err) {
                                notify.error(err);
                            }
                        );
                    } else {
                        scope.subject = subject;
                        reset();
                        scope.lightbox.isDisplayed = true;
                        scope.data.lists = createLists(subject);
                    }
                });

                scope.hide = function () {
                    // cheat
                    $('[data-drop-down]').height("");
                    $('[data-drop-down]').addClass('hidden');
                    reset();
                    scope.$emit('E_RESET_SELECTED_LIST');
                };

                /**
                 * FUNCTION PRIVATE
                 */

                function addInList(list, item) {
                    var index = list.indexOf(item);
                    if (index === -1) {
                        list.push(item);
                    } else {
                        console.error('item already in the list');
                    }
                }

                function removeInList(list, item) {
                    var index = list.indexOf(item);
                    if (index !== -1) {
                        list.splice(index, 1);
                    }
                }

                function createLists(subject) {
                    var array = [];
                    GroupService.getList(subject).then(
                        function (data) {
                            angular.forEach(data.groups.visibles, function (group) {
                                var obj = createObjectList(group.name, group.id, 'group');
                                array.push(obj);
                            });
                            angular.forEach(data.users.visibles, function (user) {
                                var obj = createObjectList(user.lastName + ' ' + user.firstName, user.id, 'user');
                                array.push(obj);
                            })
                        }
                    );
                    return array;
                }

                function createObjectList(name, id, groupOrUser) {
                    return {
                        title: name,
                        _id: id,
                        groupOrUser: groupOrUser,
                        toString: function () {
                            return this.title;
                        }
                    };
                }

                scope.clearSearch = function(){
                    scope.search = {};
                    scope.search.found = [];
                    scope.search.search = '';
                };

                scope.updateFoundUsersGroups = function() {
                    var searchTerm =  idiom.removeAccents(scope.search.search).toLowerCase();
                        
                    if(!searchTerm){
                        return [];
                    }
                    
                    scope.search.found = _.filter(scope.data.lists, function(item) {
                        let titleTest = idiom.removeAccents(item.title).toLowerCase();
                        return titleTest.indexOf(searchTerm) !== -1;
                    });
                };

                scope.confirmation = function () {
                    return (scope.isSimpleSubject ? idiom.translate('exercizer.schedule.simple.confirm') : idiom.translate('exercizer.schedule.interactive.confirm')) + ' ' +
                        $filter('date')(scope.option.due_date, 'dd/MM/yyyy') + ' ' +idiom.translate('exercizer.at') +' '+ $filter('date')(scope.option.due_time, 'HH:mm')+ ' ?';
                }
            }
        };
    }]
);
