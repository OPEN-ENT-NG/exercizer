directives.push(
    {
        name: 'subjectSchedule',
        injections: ['GroupService', '$q','SubjectScheduledService','GrainScheduledService','SubjectCopyService','GrainCopyService', 'GrainService','DateService',  (GroupService, $q, SubjectScheduledService, GrainScheduledService,SubjectCopyService,GrainCopyService, GrainService,DateService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/components/subject/subject_schedule/templates/subject-schedule.html',
                link: (scope:any, element, attrs) => {

                    /**
                     * INIT
                     */
                    scope.isDisplayed = false;
                    scope.subject = null;

                    /**
                     * RESET
                     * http://localhost:8090/userbook/visible/users/562-1454432933262
                     */

                    function reset(){
                        scope.state = 'assignSubject';
                        scope.data = {};
                        scope.data.groupList = [];
                        scope.data.userList = [];
                        scope.option = {
                            begin_date : new Date(),
                            due_date : DateService.addDays(new Date, 7)
                        };
                    }

                    /**
                     * EVENT
                     */

                    scope.clickOnItem = function(selectedItem){
                        if(selectedItem.groupOrUser == 'group'){
                            addInList(scope.data.groupList, selectedItem);
                        } else{
                            addInList(scope.data.userList, selectedItem);
                        }
                    };

                    scope.removeItem = function(selectedItem){
                        if(selectedItem.groupOrUser == 'group'){
                            removeInList(scope.data.groupList, selectedItem);
                        } else{
                            removeInList(scope.data.userList, selectedItem);
                        }
                    };

                    scope.scheduleSubject = function(){
                        if(canSchedule(scope.option)){
                            createIdList(scope.data.userList,scope.data.groupList).then(
                                function(users){
                                    if(users.length !== 0){
                                        createSubjectScheduled(scope.subject, scope.option, scope.data).then(
                                            function(subjectScheduled){
                                                console.log('subjectScheduled',subjectScheduled);
                                                angular.forEach(users, function(user){
                                                    createSubjectCopy(subjectScheduled, user).then(
                                                        function(subjectCopy){
                                                            console.log('subjectCopy',subjectCopy);
                                                            scope.isDisplayed = false;
                                                        }
                                                    )
                                                });
                                            }
                                        )
                                    } else {
                                        notify.error("Aucun utilisateur ou groupe selectionné");

                                    }
                                }
                            );
                        } else {
                            notify.error("Toutes les option de programmation de sont pas remplies");
                        }

                    };


                    function canSchedule(option){
                        if(option.begin_date && option.due_date){
                            return true;
                        } else {
                            return false;
                        }

                    }

                    function createIdList(userList, groupList){
                        // get user target by the subject scheduled
                        var deferred = $q.defer();
                        var users = [];
                        // part 1 : user
                        angular.forEach(userList, function(user) {
                            users.push({
                                id : user._id,
                                name : user.title
                            });
                        });
                        // part 2 : group
                        var promises = [];
                        angular.forEach(groupList, function(group) {
                            promises.push(GroupService.getUserFromGroup(group));
                        });
                        $q.all(promises).then(
                            function(data) {
                                angular.forEach(data, function(userList) {
                                    angular.forEach(userList, function(user) {
                                        users.push({
                                            id : user.id,
                                            name : user.displayName
                                        });
                                    });
                                });
                                deferred.resolve(users);
                            }
                        );
                        return deferred.promise;
                    }

                    function createSubjectScheduled(subject, option, data){
                        var deferred = $q.defer();
                        // create scheduled subject from subject
                        var subjectScheduled = SubjectScheduledService.createFromSubject(subject);
                        // add attributes from option
                        subjectScheduled.begin_date = option.begin_date;
                        subjectScheduled.due_date = option.due_date;
                        subjectScheduled.estimated_duration = option.estimated_duration;
                        subjectScheduled.is_one_shot_submit = option.is_one_shot_submit;
                        //subjectScheduled.has_automatic_display = option.has_automatic_display;
                        // persist scheduled subject
                        subjectScheduled.scheduled_at = createSubjectScheduledAt(data);
                        SubjectScheduledService.persist(subjectScheduled).then(
                            function(subjectScheduled){
                                // create grainScheduled
                                createGrainListScheduled(subjectScheduled, subject).then(
                                    function(data){
                                        // resolve
                                        deferred.resolve(subjectScheduled);
                                    }
                                );

                            },
                            function(err){
                                deferred.reject(err);
                            }
                        );

                        return deferred.promise;
                    }

                    function createSubjectScheduledAt(data){
                        if (!data){
                            throw "data missing";
                        }
                        var res = {
                            groupsList : [],
                            userList : []
                        };
                        angular.forEach(data.groupList, function(group) {
                            res.groupsList.push({
                                _id : group._id,
                                name : group.title
                            })
                        });
                        angular.forEach(data.userList, function(user) {
                            res.userList.push({
                                _id : user._id,
                                name : user.title
                            })
                        });
                        return JSON.stringify(res);
                    }


                    function createGrainListScheduled(subjectScheduled, subject){
                        var deferred = $q.defer();
                        // get list grain from subject
                        GrainService.getListBySubject(subject).then(
                            function(data){
                                // create grain list scheduled
                                var grainListScheduled = GrainScheduledService.createGrainScheduledList(data);
                                var promises = [];
                                // persist grainListScheduled
                                angular.forEach(grainListScheduled, function(grainScheduled) {
                                    grainScheduled.subject_scheduled_id = subjectScheduled.id;
                                    promises.push(GrainScheduledService.persist(grainScheduled, subject));
                                });
                                $q.all(promises).then(
                                    function(data){
                                        deferred.resolve(data);
                                    }
                                )
                            }
                        );
                        return deferred.promise;
                    }

                    function createSubjectCopy(subjectScheduled, user){
                        var deferred = $q.defer();
                        // create copy subject from subject scheduled;
                        var subjectCopy = SubjectCopyService.createFromSubjectScheduled(subjectScheduled);
                        // add attributes from option
                        subjectCopy.owner = user.id;
                        subjectCopy.owner_username = user.name;
                        // persist subjectCopy
                        SubjectCopyService.persist(subjectCopy).then(
                            function(subjectCopy){
                                // create grainScheduled
                                // no callback for the create of grain copy
                                createGrainListCopy(subjectCopy, subjectScheduled);
                                // resolve
                                deferred.resolve(subjectCopy);
                            },
                            function(err){
                                deferred.reject(err);
                            }
                        );
                        return deferred.promise;
                    }


                    function createGrainListCopy(subjectCopy, subjectScheduled){
                        var deferred = $q.defer();
                        // get list grain from subject
                        GrainScheduledService.getListBySubjectScheduled(subjectScheduled).then(
                            function(grainScheduledList){
                                // create grain list scheduled
                                var grainListCopy = GrainCopyService.createGrainCopyList(grainScheduledList);
                                var promises = [];
                                // persist grainListScheduled
                                angular.forEach(grainListCopy, function(grainCopy) {
                                    grainCopy.subject_copy_id = subjectCopy.id;
                                    promises.push(GrainCopyService.persist(grainCopy, subjectScheduled));
                                });
                                $q.all(promises).then(
                                    function(data){
                                        deferred.resolve(data);
                                    }
                                )
                            }
                        );
                        return deferred.promise;
                    }


                    /**
                     * MODAL
                     */

                    // event to display model
                    scope.$on("E_DISPLAY_MODAL_SCHEDULE_SUBJECT", function(event, subject) {
                        scope.subject = subject;
                        scope.isDisplayed = true;
                        reset();
                        scope.data.lists = createLists(subject);

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

                    function addInList(list, item){
                        var index = list.indexOf(item);
                        if(index === -1){
                            list.push(item);
                        } else{
                            console.error('item already in the list');
                        }
                    }
                    function removeInList(list, item){
                        var index = list.indexOf(item);
                        if(index !== -1){
                            list.splice(index, 1);
                        }
                    }

                    function createLists(subject){
                        var array = [];
                        GroupService.getList(subject).then(
                            function(data){
                                angular.forEach(data.groups.visibles, function(group){
                                        var obj = createObjectList(group.name, group.id, 'group');
                                        array.push(obj);
                                });
                                angular.forEach(data.users.visibles, function(group){
                                    var obj = createObjectList(group.username, group.id, 'user');
                                    array.push(obj);
                                })
                            }
                        );
                        return array;
                    }

                    function createObjectList(name, id, groupOrUser){
                        return {
                            title : name,
                            _id : id,
                            groupOrUser : groupOrUser,
                            toString : function() {
                                return this.title;
                            }
                        };
                    }
                }
            };
        }]
    }
);
