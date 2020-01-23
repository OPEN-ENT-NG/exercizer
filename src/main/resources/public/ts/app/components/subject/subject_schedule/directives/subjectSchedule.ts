import { ng, notify, idiom, DatepickerDelegate } from 'entcore';
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
                let dateModels = [];
                scope.datePickerDelegate = {
                    onDestroy(args){
                        dateModels = dateModels.filter(test=>test!==args.ngModel);
                    },
                    onInit(args){
                        dateModels.push(args.ngModel);
                    },
                    onValidationChange(){}
                } as DatepickerDelegate;
                scope.now = new Date();
                const toMoment = (date:Date, time:string)=>{
                    const formatted = moment(date).format("DD/MM/YYYY");
                    return moment(`${formatted} ${time}`,["DD/MM/YYYY HH:mm"], true)
                }
                scope.isValidSubject = () =>{
                    for(let modl of dateModels){
                        if(modl.$invalid) return false;
                    }
                    if(!scope.lightbox || scope.lightbox.state != 'option')return false;
                    if(scope.isSimpleSubject) return scope.isValidSimpleSubject();
                    else return scope.isValidComplexSubject();
                }
                scope.isValidComplexSubject = () =>{
                    const begin = toMoment(scope.option.begin_date,scope.option.begin_time);
                    const due = toMoment(scope.option.due_date,scope.option.due_time);
                    return begin.isValid() 
                            && due.isValid() 
                            && begin.toDate() < due.toDate();
                }
                scope.isValidSimpleSubject = () =>{
                    const begin = toMoment(scope.option.begin_date,scope.option.begin_time);
                    const due = toMoment(scope.option.due_date,scope.option.due_time);
                    const correct = toMoment(scope.option.corrected_date,scope.option.corrected_time);
                    return begin.isValid() 
                            && due.isValid() 
                            && correct.isValid() 
                            && begin.toDate() < due.toDate() 
                            && due.toDate() <= correct.toDate();
                }
                /**
                 * INIT
                 */
                scope.subject = null;
                scope.isSimpleSubject = null;
                scope.scheduleSubjectInProgress = false;
                scope.selector = {
                    loading: false
                };

                /**
                 * RESET
                 * http://localhost:8090/userbook/visible/users/562-1454432933262
                 */

                function reset() {
                    scope.lightbox = {
                        state: 'type',
                        isDisplayed : false
                    };
                    scope.data = {groupList:[],userList:[],exclude:[]};
                    scope.option = {
                        mode: "classic",
                        begin_date: new Date(),
                        due_date: DateService.addDays(new Date, 7),
                        corrected_date: DateService.addDays(new Date, 8),
                        begin_time: "00:00",
                        due_time: "23:59",
                        corrected_time: "00:00"
                    };

                    scope.selector.selectedGroup = false;

                    scope.search = {};
                    scope.clearSearch();
                }

                /**
                 * EVENT
                 */

                scope.clickOnItem = async function (selectedItem) {
                    if (scope.selector.loading)
                        return;
                    scope.selector.loading = true;
                    scope.clearSearch();
                    await addItemList(selectedItem);
                    scope.selector.loading = false;
                };

                async function addItemList(selectedItem) {
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
                                    scope.data.userList = _.sortBy(scope.data.userList, 'name');
                                }
                            });
                        } 
                        else if (selectedItem.groupOrUser == 'user') {
                            list.push(selectedItem);
                            scrollToUser(selectedItem['_id']);
                            scope.data.userList = _.sortBy(scope.data.userList, 'name');
                        }
                        else {
                            var members = await GroupService.getMembersFromBookmark(selectedItem);
                            await members.groups.forEach(async function(item) {
                                await addItemList(_.findWhere(scope.data.lists, { _id: item.id }));
                            });
                            await members.users.forEach(async function (item) {
                                await addItemList(_.findWhere(scope.data.lists, { _id: item.id }));
                            });
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
                                    name: user.name,
                                    profile: user.profiles[0],
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
                    subjectScheduled.is_training_mode = option.mode == 'training';
                    if (subjectScheduled.is_training_mode) {
                        subjectScheduled.is_one_shot_submit = false;
                        subjectScheduled.is_training_permitted = false;
                        subjectScheduled.begin_date = moment(new Date(0))
                        .toISOString().replace(/T..:../, "T00:00");
                    subjectScheduled.due_date = moment(new Date(0))
                        .toISOString().replace(/T..:../, "T00:00");
                    } else {
                        subjectScheduled.begin_date = moment(option.begin_date).hours(14).minutes(0).seconds(0)
                        .toISOString().replace(/T..:../, "T"+option.begin_time);
                        subjectScheduled.due_date = moment(option.due_date).hours(14).minutes(0).seconds(0)
                        .toISOString().replace(/T..:../, "T"+option.due_time);
                        subjectScheduled.is_one_shot_submit = !option.allow_students_to_update_copy;
                        subjectScheduled.is_training_permitted = !option.forbid_training;
                    }
                    subjectScheduled.estimated_duration = option.estimated_duration;
                    subjectScheduled.random_display = !!option.random_display;
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
                            name: group.name
                        })
                    });
                    angular.forEach(data.userList, function (user) {
                        if (user && user.groupId === undefined) {
                            res.userList.push({
                                _id: user['_id'],
                                name: user.name,
                                profile: user.profile
                            })
                        } else if (user && user.exclude) {
                            res.exclude.push({
                                _id: user['_id'],
                                name: user.name,
                                profile: user.profile
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
                            angular.forEach(data.bookmarks, function (group) {
                                var obj = createObjectList(group.name, group.id, 'bookbark', null, null, true);
                                array.push(obj);
                            });
                            angular.forEach(data.groups.visibles, function (group) {
                                var obj = createObjectList(group.name, group.id, 'group', null, group.structureName, false);
                                array.push(obj);
                            });
                            angular.forEach(data.users.visibles, function (user) {
                                var obj = createObjectList(user.lastName + ' ' + user.firstName, user.id, 'user', user.profile, null, false);
                                array.push(obj);
                            })
                        }
                    );
                    return array;
                }

                function createObjectList(name, id, groupOrUser, profile, structureName, bookmark) {
                    return {
                        name: name,
                        _id: id,
                        groupOrUser: groupOrUser,
                        profile: profile,
                        structureName: structureName,
                        type: bookmark ? "sharebookmark" : null,
                        toString: function () {
                            return this.name;
                        }
                    };
                }

                scope.clearSearch = function(){
                    if (scope.search) {
                        scope.search.found = [];
                        scope.search.search = '';
                        scope.selector.search = '';
                    }

                    if (scope.data && !scope.selector.selectedGroup) {
                        clearSelectedList(undefined);
                    } else {
                        scope.selector.selectedGroup = false;
                    }
                };

                scope.updateFoundUsersGroups = function() {
                    var searchTerm =  idiom.removeAccents(scope.search.search).toLowerCase();
                        
                    if(!searchTerm){
                        return [];
                    }
                    
                    scope.search.found = _.filter(scope.data.lists, function(item) {
                        let titleTest = idiom.removeAccents(item.name).toLowerCase();
                        return titleTest.indexOf(searchTerm) !== -1;
                    });
                };

                scope.confirmation = function () {
                    if(scope.option){
                        if (scope.option.mode == 'classic') {
                            return idiom.translate('exercizer.schedule.confirm').replace(/\{0\}/g, $filter('date')(scope.option.begin_date, 'dd/MM/yyyy'))
                                .replace(/\{1\}/g, $filter('date')(scope.option.begin_time, 'HH:mm'))
                                .replace(/\{2\}/g, $filter('date')(scope.option.due_date, 'dd/MM/yyyy'))
                                .replace(/\{3\}/g, $filter('date')(scope.option.due_time, 'HH:mm'));
                        } else {
                            return idiom.translate('exercizer.schedule.confirm.training');
                        }
                    }
                }
                scope.switchMode = function () {
                    if (scope.option.mode == 'classic') {
                        scope.option.mode = 'training';
                    } else {
                        scope.option.mode = 'classic';
                    }
                }
            }
        };
    }]
);
