directives.push(
    {
        name: 'subjectSchedule',
        injections: ['GroupService', '$q', 'SubjectScheduledService', 'GrainScheduledService', 'SubjectCopyService', 'GrainCopyService', 'GrainService', 'DateService', (GroupService, $q, SubjectScheduledService, GrainScheduledService, SubjectCopyService, GrainCopyService, GrainService, DateService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/subject/subject_schedule/templates/subject-schedule.html',
                link: (scope:any) => {

                    /**
                     * INIT
                     */
                    scope.isDisplayed = false;
                    scope.subject = null;
                    scope.scheduleSubjectInProgress = false;

                    /**
                     * RESET
                     * http://localhost:8090/userbook/visible/users/562-1454432933262
                     */

                    function reset() {
                        scope.state = 'assignSubject';
                        scope.data = {};
                        scope.data.groupList = [];
                        scope.data.userList = [];
                        scope.option = {
                            begin_date: new Date(),
                            due_date: DateService.addDays(new Date, 7)
                        };
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

                    scope.removeItem = function (selectedItem) {
                        if (selectedItem.groupOrUser == 'group') {
                            removeInList(scope.data.groupList, selectedItem);
                        } else {
                            removeInList(scope.data.userList, selectedItem);
                        }
                    };

                    scope.scheduleSubject = function () {
                        scope.scheduleSubjectInProgress = true;
                        canSchedule(scope.option, scope.subject).then(function() {
                            createIdList(scope.data.userList, scope.data.groupList).then(
                                function (users) {
                                    if (users.length !== 0) {
                                        scheduleSubject(scope.subject, scope.option, scope.data, users).then(function() {
                                                reset();
                                                scope.isDisplayed = false;
                                                scope.scheduleSubjectInProgress = false;
                                                notify.info("Le sujet a bien été programmé.");
                                        }, function(err) {
                                            scope.scheduleSubjectInProgress = false;
                                            notify.error(err);
                                        });


                                        /*createSubjectScheduled(scope.subject, scope.option, scope.data).then(
                                            function (subjectScheduled) {
                                                //console.info('subjectScheduled',subjectScheduled);
                                                var promises = [];
                                                angular.forEach(users, function (user) {
                                                    promises.push(createSubjectCopy(subjectScheduled, user).then(
                                                        function (subjectCopy) {
                                                            //console.info('subjectCopy',subjectCopy);
                                                        }
                                                    ));
                                                });
                                                $q.all(promises).then(
                                                    // success
                                                    // results: an array of data objects from each deferred.resolve(data) call
                                                    function (results) {
                                                        reset();
                                                        scope.isDisplayed = false;
                                                        scope.scheduleSubjectInProgress = false;
                                                        notify.info("Le sujet a bien été programmé");
                                                    }
                                                );

                                            }
                                        )*/
                                    } else {
                                        scope.scheduleSubjectInProgress = false;
                                        notify.error("Aucun utilisateur ou groupe sélectionné.");
                                    }
                                }
                            );
                        }, function(err){
                            scope.scheduleSubjectInProgress = false;
                            console.error(err);
                            notify.error(err);
                        });
                    };


                    function canSchedule(option, subject) {
                        var deferred = $q.defer();
                        if (option.begin_date && option.due_date) {
                            if (DateService.compare_after(option.due_date, option.begin_date, true)) {
                                // shchedule options is correct , now check subject itself
                                GrainService.getListBySubject(subject).then(
                                    function (data) {
                                        // create grain list scheduled
                                        console.log('grain list');
                                        if(data.length == 0 ){
                                            deferred.reject("Il est impossible de distribuer un sujet vide.");
                                        } else {
                                            // question : all grain exept statement
                                            var validationGrain = true;
                                            var numberQuestion  = 0;
                                            angular.forEach(data, function(grain){
                                                    switch (grain.grain_type_id){
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
                                                            if(!grain.grain_data.custom_data.correct_answer_list || grain.grain_data.custom_data.correct_answer_list.length === 0){
                                                                validationGrain =  false;
                                                            }
                                                            numberQuestion++;
                                                            break;
                                                        case 7 :
                                                            numberQuestion++;
                                                            if(!grain.grain_data.custom_data.correct_answer_list || grain.grain_data.custom_data.correct_answer_list.length === 0){
                                                                validationGrain =  false;
                                                            } else{
                                                                var allFalse = true;
                                                                angular.forEach(grain.grain_data.custom_data.correct_answer_list, function(current){
                                                                    if(current.isChecked){
                                                                        allFalse = false;
                                                                    }
                                                                });
                                                                if(allFalse){
                                                                    validationGrain = false;
                                                                }
                                                            }
                                                            break;
                                                        case 8 :
                                                            numberQuestion++;
                                                            if(!grain.grain_data.custom_data.correct_answer_list || grain.grain_data.custom_data.correct_answer_list.length === 0){
                                                                validationGrain =  false;
                                                            }
                                                            break;
                                                        case 9 :
                                                            numberQuestion++;
                                                            if(!grain.grain_data.custom_data.correct_answer_list || grain.grain_data.custom_data.correct_answer_list.length === 0){
                                                                validationGrain =  false;
                                                            }
                                                            break;
                                                        case 10 :
                                                            numberQuestion++;
                                                            // TODO
                                                            break;
                                                        case 11 :
                                                            numberQuestion++;
                                                            // TODO
                                                            break;
                                                        default :
                                                            console.error("switch default for grain_type_id = ", grain.grain_type_id);
                                                    }

                                            });
                                            if(numberQuestion === 0){
                                                deferred.reject("Il est impossible de distribuer un sujet vide.");
                                            } else {
                                                if(validationGrain === true){
                                                    deferred.resolve();
                                                } else{
                                                    deferred.reject("Le sujet ne peut pas être distribuer car des questions sans réponses renseignées subsistent.");
                                                }
                                            }
                                        }
                                    },
                                    function (err){
                                        deferred.reject(err);
                                    }
                                );
                            } else {
                                deferred.reject("Les dates de distribution ne sont pas cohérentes.")
                            }
                        } else {
                            scope.scheduleSubjectInProgress = false;
                            deferred.reject("Toutes les options de distribution ne sont pas remplies.")
                        }
                        return deferred.promise;
                    }


                    function createIdList(userList, groupList) {
                        // get user target by the subject scheduled
                        var deferred = $q.defer();
                        var users = [];
                        // part 1 : user
                        angular.forEach(userList, function (user) {
                            users.push({
                                id: user._id,
                                name: user.title
                            });
                        });
                        // part 2 : group
                        var promises = [];
                        angular.forEach(groupList, function (group) {
                            promises.push(GroupService.getUserFromGroup(group));
                        });
                        $q.all(promises).then(
                            function (data) {
                                angular.forEach(data, function (userList) {
                                    angular.forEach(userList, function (user) {
                                        users.push({
                                            id: user.id,
                                            name: user.displayName
                                        });
                                    });
                                });
                                var filtered_array = [], bool;
                                angular.forEach(users, function (current_user) {
                                    bool = true;
                                    angular.forEach(filtered_array, function (filtered_current_user) {
                                        if (filtered_current_user.id == current_user.id) {
                                            bool = false;
                                        }
                                    });
                                    if (bool) {
                                        filtered_array.push(current_user);
                                    }
                                });
                                deferred.resolve(filtered_array);
                            }
                        );
                        return deferred.promise;
                    }

                    function scheduleSubject(subject, option, data, users) {
                        var deferred = $q.defer(),
                            subjectScheduled = SubjectScheduledService.createFromSubject(subject);

                        subjectScheduled.begin_date = option.begin_date;
                        subjectScheduled.due_date = option.due_date;
                        subjectScheduled.estimated_duration = option.estimated_duration;
                        subjectScheduled.is_one_shot_submit = !option.allow_students_to_update_copy;
                        subjectScheduled.scheduled_at = createSubjectScheduledAt(data);

                        GrainService.getListBySubject(subject).then(
                            function (data) {

                                var grainScheduledList = GrainScheduledService.createGrainScheduledList(data),
                                    grainCopyListTemplate = GrainCopyService.createGrainCopyList(grainScheduledList),
                                    subjectCopyTemplate = new SubjectCopy();

                                subjectCopyTemplate.has_been_started = false;

                                SubjectScheduledService.schedule(subjectScheduled, grainScheduledList, subjectCopyTemplate, grainCopyListTemplate, users).then(
                                    function() {
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

                    /*function createSubjectScheduled(subject, option, data) {
                        var deferred = $q.defer();
                        // create scheduled subject from subject
                        var subjectScheduled = SubjectScheduledService.createFromSubject(subject);
                        // add attributes from option
                        subjectScheduled.begin_date = option.begin_date;
                        subjectScheduled.due_date = option.due_date;
                        subjectScheduled.estimated_duration = option.estimated_duration;
                        subjectScheduled.is_one_shot_submit = !option.allow_students_to_update_copy;
                        //subjectScheduled.has_automatic_display = option.has_automatic_display;
                        // persist scheduled subject
                        subjectScheduled.scheduled_at = createSubjectScheduledAt(data);
                        SubjectScheduledService.persist(subjectScheduled).then(
                            function (subjectScheduled) {
                                // create grainScheduled
                                createGrainListScheduled(subjectScheduled, subject).then(
                                    function (data) {
                                        // resolve
                                        deferred.resolve(subjectScheduled);
                                    }
                                );

                            },
                            function (err) {
                                deferred.reject(err);
                            }
                        );

                        return deferred.promise;
                    }*/

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
                        return JSON.stringify(res);
                    }


                    /*function createGrainListScheduled(subjectScheduled, subject) {
                        var deferred = $q.defer();
                        // get list grain from subject
                        GrainService.getListBySubject(subject).then(
                            function (data) {
                                // create grain list scheduled
                                var grainListScheduled = GrainScheduledService.createGrainScheduledList(data);
                                var promises = [];
                                // persist grainListScheduled
                                angular.forEach(grainListScheduled, function (grainScheduled) {
                                    grainScheduled.subject_scheduled_id = subjectScheduled.id;
                                    promises.push(GrainScheduledService.persist(grainScheduled, subject));
                                });
                                $q.all(promises).then(
                                    function (data) {
                                        deferred.resolve(data);
                                    }
                                )
                            }
                        );
                        return deferred.promise;
                    }*/

                    /*function createSubjectCopy(subjectScheduled, user) {
                        var deferred = $q.defer();
                        // create copy subject from subject scheduled;
                        var subjectCopy = SubjectCopyService.createFromSubjectScheduled(subjectScheduled);
                        // add attributes from option
                        subjectCopy.owner = user.id;
                        subjectCopy.owner_username = user.name;
                        // persist subjectCopy
                        SubjectCopyService.persist(subjectCopy).then(
                            function (subjectCopy) {
                                // create grainScheduled
                                // no callback for the create of grain copy
                                createGrainListCopy(subjectCopy, subjectScheduled);
                                // resolve
                                deferred.resolve(subjectCopy);
                            },
                            function (err) {
                                deferred.reject(err);
                            }
                        );
                        return deferred.promise;
                    }*/


                    /*function createGrainListCopy(subjectCopy, subjectScheduled) {
                        var deferred = $q.defer();
                        // get list grain from subject
                        GrainScheduledService.getListBySubjectScheduled(subjectScheduled).then(
                            function (grainScheduledList) {
                                // create grain list scheduled
                                var grainListCopy = GrainCopyService.createGrainCopyList(grainScheduledList);
                                var promises = [];
                                // persist grainListScheduled
                                angular.forEach(grainListCopy, function (grainCopy) {
                                    grainCopy.subject_copy_id = subjectCopy.id;
                                    promises.push(GrainCopyService.persist(grainCopy, subjectScheduled));
                                });
                                $q.all(promises).then(
                                    function (data) {
                                        deferred.resolve(data);
                                    }
                                )
                            }
                        );
                        return deferred.promise;
                    }*/


                    /**
                     * MODAL
                     */

                        // event to display model
                    scope.$on("E_DISPLAY_MODAL_SCHEDULE_SUBJECT", function (event, subject) {
                        GrainService.getListBySubject(subject).then(
                            function (grainList:IGrain[]) {
                                if (grainList.length > 0) {
                                    scope.subject = subject;
                                    scope.isDisplayed = true;
                                    reset();
                                    scope.data.lists = createLists(subject);
                                } else {
                                    notify.info('Vous ne pouvez pas distribuer un sujet vide.');
                                }
                            },
                            function (err) {
                                notify.error(err);
                            }
                        );

                    });

                    scope.hide = function () {
                        // cheat
                        $('[data-drop-down]').height("");
                        $('[data-drop-down]').addClass('hidden');
                        scope.isDisplayed = false;
                        scope.state = 'assignSubject';
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
                                angular.forEach(data.users.visibles, function (group) {
                                    var obj = createObjectList(group.username, group.id, 'user');
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
                }
            };
        }]
    }
);
