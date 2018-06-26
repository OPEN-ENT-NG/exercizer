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
                    scope.data = {groupList:[],userList:[],exclude:[]};
                    scope.option = {
                        begin_date: new Date(),
                        due_date: DateService.addDays(new Date, 7),
                        corrected_date: DateService.addDays(new Date, 8),
                        begin_time: "00:00",
                        due_time: "23:59",
                        corrected_time: "00:00"
                    };

                    scope.selectedGroup = false;

                    scope.search = {};
                    scope.clearSearch();
                }

                /**
                 * EVENT
                 */

                scope.clickOnItem = function (selectedItem) {
                    var list = (selectedItem.groupOrUser == 'group') ? scope.data.groupList : scope.data.userList;
                    var index = list.indexOf(selectedItem);
                    if (index === -1) {
                        clearSelectedList(undefined);
                        selectedItem.selected = false;

                        if (selectedItem.groupOrUser == 'group') {
                            findMembers(selectedItem['_id'], isEmpty => {
                                if (isEmpty) {
                                    notify.info("exercizer.schedule.empty.group");
                                } else {
                                    list.push(selectedItem);
                                    scope.data.userList = _.sortBy(scope.data.userList, 'title');
                                }
                            });
                        } else {
                            list.push(selectedItem);
                            scrollToUser(selectedItem['_id']);
                            scope.data.userList = _.sortBy(scope.data.userList, 'title');
                        }
                    } else {
                        console.error('item already in the list');
                    }
                };

                function findMembers(groupId, cb) {
                    GroupService.findMembers(groupId).then(
                        function (data) {
                            var isEmpty = data.length === 0;
                            _.forEach(data, function (user) {
                                scope.data.userList.push({
                                    _id: user['_id'],
                                    title: user.name,
                                    selected: false,
                                    exclude: false,
                                    groupId: groupId
                                });
                            });
                            cb(isEmpty);
                        }, function (err) {
                            notify.error(err);
                        }
                    );
                };

                function scrollToUser(userId) {
                    setTimeout(() => $('#userScroll').animate({ scrollTop: $('#userScroll').scrollTop() - $('#userScroll').offset().top + $('#user-' + userId).offset().top}, 500), 100);
                }
                
                scope.checkTime = function (time, def?) {
                    return time.match("^([01][0-9]|2[0-3]):[0-5][0-9]$") ? time : def ? "23:59" : "00:00";
                };
                
                scope.selectGroupItem = function (selectedItem) {
                    clearSelectedList(selectedItem);
                    selectedItem.selected = !selectedItem.selected;
                    scope.selectedGroup = selectedItem.selected;
                    _.forEach(scope.data.userList, user => {
                        if (user.groupId === selectedItem['_id']) user.selected = selectedItem.selected;
                    });
                };

                scope.getTotalUser = function() {
                    return (scope.data && scope.data.userList.length > 0) ? _.countBy(scope.data.userList, function(user) {
                        return (user && user.exclude === true) ? 'exclude': 'ok';
                    }) : {"ok":0};
                };

                scope.removeItem = function (selectedItem) {
                    var list = (selectedItem.groupOrUser == 'group') ? scope.data.groupList : scope.data.userList;

                    if (selectedItem.groupOrUser === 'group') {
                        scope.data.userList = _.reject(scope.data.userList, (user) => {
                            return (user && user.groupId && selectedItem['_id'] === user.groupId);
                        });
                    } else {
                       if (selectedItem.groupId) {
                           selectedItem.exclude = true;

                           var isEmptyGroup = true;
                           //check not empty group else erase the group
                           _.forEach(scope.data.userList, (user) => {
                               if (selectedItem.groupId === user.groupId && !user.exclude) {
                                   isEmptyGroup = false;
                                   return false;
                               }
                           });

                           if (isEmptyGroup) {
                               // delete group
                               scope.data.groupList = _.reject(scope.data.groupList, (group) => {
                                   return (group && selectedItem.groupId === group['_id']);
                               });
                               //delete members
                               scope.data.userList = _.reject(scope.data.userList, (user) => {
                                   return (user && user.groupId && selectedItem.groupId === user.groupId);
                               });
                           } else {
                               scope.selectedGroup = true;
                           }

                           //ERASE same user in implict user (not from group)
                           scope.data.userList = _.reject(scope.data.userList, (user) => {
                               return (user && !user.exclude && selectedItem.title === user.title);
                           });
                       }

                        //mark same user of another group as exclude
                        _.forEach(scope.data.userList, (user) => {
                            if (user && user.groupId && selectedItem.title === user.title) {
                                user.exclude = true;
                            }
                        });
                    }

                    if (!selectedItem.exclude) {
                        var index = list.indexOf(selectedItem);
                        if (index !== -1) {
                            list.splice(index, 1);
                        }
                    }
                };

                scope.filterAllUser = function () {
                    return function (user) {
                        var searchTerm =  idiom.removeAccents(scope.search.user).toLowerCase();

                        if(!searchTerm){
                            return true;
                        }
                        return idiom.removeAccents(user.title).toLowerCase().indexOf(searchTerm) !== -1;
                    };
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
                        userList: [],
                        exclude: []
                    };
                    angular.forEach(data.groupList, function (group) {
                        res.groupList.push({
                            _id: group['_id'],
                            name: group.title
                        })
                    });
                    angular.forEach(data.userList, function (user) {
                        if (user && user.groupId === undefined) {
                            res.userList.push({
                                _id: user['_id'],
                                name: user.title
                            })
                        } else if (user && user.exclude) {
                            res.exclude.push({
                                _id: user['_id'],
                                name: user.title
                            })
                        }
                    });

                    if (res.exclude.length > 0) res.exclude = _.uniq(res.exclude);

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

                           
                function clearSelectedList(selectedGroupItem) {
                   _.forEach(scope.data.groupList, group => {
                       if (selectedGroupItem && selectedGroupItem._id === group._id) return;
                       group.selected = false; 
                    });

                    _.forEach(scope.data.userList, user => {
                        user.selected = false;
                    });
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
                    if (scope.search) {
                        scope.search.found = [];
                        scope.search.search = '';
                        scope.search.user = '';
                    }

                    if (scope.data && !scope.selectedGroup) {
                        clearSelectedList(undefined);
                    } else {
                        scope.selectedGroup = false;
                    }
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
                    if(scope.option)
                        return (scope.isSimpleSubject ? idiom.translate('exercizer.schedule.simple.confirm') : idiom.translate('exercizer.schedule.interactive.confirm')) + ' ' +
                            $filter('date')(scope.option.due_date, 'dd/MM/yyyy') + ' ' +idiom.translate('exercizer.at') +' '+ $filter('date')(scope.option.due_time, 'HH:mm')+ ' ?';
                }
            }
        };
    }]
);
