directives.push(
    {
        name: 'reminders',
        injections: ['SubjectCopyService',(SubjectCopyService) => {
            return {
                restrict: 'E',
                scope: { 
                    isDisplayed: "=",
                    reminderCopies: "=",
                    selectedSubjectScheduled: "="
                    
                },
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/common/templates/reminders.html',
                link: (scope:any, element, attrs) => {

                    scope.$watch('isDisplayed', function(newValue, oldValue) {
                        if(scope.isDisplayed !== undefined){
                            resetRemind();
                        }
                    });
                    
                    resetRemind();

                    function resetRemind() {
                        scope.remind = {                           
                            step:'choose',
                            subject:'',
                            body:''
                        };
                    };

                    scope.sendReminder = function() {
                        var copyIds = [];

                        angular.forEach(scope.reminderCopies, function(copy){
                            copyIds.push(copy.id);
                        });

                        if (scope.remind.step === 'auto') {
                            SubjectCopyService.remindAutomaticCopies(copyIds, scope.selectedSubjectScheduled.id).then(
                                function () {
                                    resetRemind();
                                    scope.isDisplayed = false;
                                    notify.info('exercizer.reminder.sent');
                                },
                                function (err) {
                                    notify.error(err);
                                }
                            );
                        } else {
                            if (!scope.remind.subject || scope.remind.subject === '') {
                                notify.error('exercizer.reminder.check.subject');
                            } else if (!scope.remind.body || scope.remind.body === '') {
                                notify.error('exercizer.reminder.check.body');
                            } else {
                                SubjectCopyService.remindCustomCopies(copyIds, scope.remind.subject, scope.remind.body).then(
                                    function () {
                                        resetRemind();
                                        scope.isDisplayed = false;
                                        notify.info('exercizer.reminder.sent');
                                    },
                                    function (err) {
                                        notify.error(err);
                                    }
                                );
                            }
                        }
                    };

                    scope.closeReminder = function() {
                        resetRemind();
                        scope.isDisplayed = false;
                    };
                }
            };
        }]
    }
);
