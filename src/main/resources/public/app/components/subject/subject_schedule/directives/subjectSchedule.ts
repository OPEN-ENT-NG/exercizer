directives.push(
    {
        name: 'subjectSchedule',
        injections: ['FolderService', 'SubjectService', (FolderService, SubjectService) => {
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
                        scope.data.lists = getGroupList();
                        scope.data.groupList = [];
                        scope.option = {};
                    }

                    /**
                     * EVENT
                     */

                    scope.clickOnItem = function(selectedItem){
                        addInList(scope.data.groupList, selectedItem);
                    };

                    scope.scheduleSubject = function(){
                        console.log('TODO programmer !');
                    };

                    scope.removeGroup= function(group){
                        var index = scope.data.groupList.indexOf(group);
                        if(index !== -1){
                            scope.data.groupList.splice(index, 1);
                        }
                    };

                    scope.removeUser= function(user){
                        console.log('TODO remove user', user);
                    };

                    /**
                     * MODAL
                     */

                    // event to display model
                    scope.$on("E_DISPLAY_MODAL_SCHEDULE_SUBJECT", function(event, subject) {
                        scope.subject = subject;
                        scope.isDisplayed = true;
                        reset();
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

                    function getGroupList(){
                        var array = [];
                        angular.forEach(model.me.classNames, function(value){
                            var res = value.split("$");
                            if(res.length === 2){
                                var obj = createObjectGroup(res);
                                array.push(obj);
                            } else{
                                console.error("impossible to find class name");
                            }
                        });
                        return array;
                    }

                    function createObjectGroup(res){
                        return {
                            title : res[1],
                            _id : res[0],
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
