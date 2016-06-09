directives.push(
    {
        name: 'subjectSchedule',
        injections: ['GroupService', '$q', (GroupService, $q) => {
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
                        scope.option = {};
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
                        var idList = [];
                        angular.forEach(scope.data.userList, function(user) {
                            idList.push(user._id);
                        });
                        var promises = [];
                        angular.forEach(scope.data.groupList, function(group) {
                            promises.push(GroupService.getUserFromGroup(group));
                        });
                        $q.all(promises).then(
                            function(data) {
                                angular.forEach(data, function(userList) {
                                    angular.forEach(userList, function(user) {
                                        idList.push(user.id);
                                    });
                                });
                                console.log(idList);
                            }, function(err) {
                                console.error(err);
                            }
                        );
                    };


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
                                console.log(data);
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
