directives.push(
    {
        name: 'subjectSchedule',
        injections: ['GroupService', 'SubjectService', (GroupService, SubjectService) => {
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
                        console.log('TODO programmer !');
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
