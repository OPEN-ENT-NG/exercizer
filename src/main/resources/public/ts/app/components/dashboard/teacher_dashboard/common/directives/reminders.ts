import { EditTrackingEvent, ng, notify, trackingService } from 'entcore';

export const reminders = ng.directive('reminders', ['SubjectCopyService',(SubjectCopyService) => {
    return {
        restrict: 'E',
        scope: { 
            isDisplayed: "=",
            reminderCopies: "=",
            selectedSubjectScheduled: "="
            
        },
        templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/common/templates/reminders.html',
        link: (scope:any, element, attrs) => {

            scope.$watch('isDisplayed', function(newValue, oldValue) {
                if(scope.isDisplayed !== undefined){
                    resetRemind();
                }
            });
            
            resetRemind();
            let tracker: EditTrackingEvent;
            function resetRemind() {
                scope.remind = {                           
                    step:'choose',
                    subject:'',
                    body:'',
                };
                const id = scope.selectedSubjectScheduled? scope.selectedSubjectScheduled.id : 'custom';
                tracker = trackingService.trackEdition({resourceId: id, resourceUri: `/exercizer/reminder/${id}`})
            };
            scope.getTracker = function(){
                return tracker;
            }
            scope.sendReminder = function() {
                var copyIds = [];
                angular.forEach(scope.reminderCopies, function(copy){
                    copyIds.push(copy.id);
                });

                if (scope.remind.step === 'auto') {
                    tracker && tracker.onStop();
                    SubjectCopyService.remindAutomaticCopies(copyIds, scope.selectedSubjectScheduled.id).then(
                        function () {
                            tracker && tracker.onFinish(true);
                            resetRemind();
                            scope.isDisplayed = false;
                            notify.info('exercizer.reminder.sent');
                        },
                        function (err) {
                            notify.error(err);
                            tracker && tracker.onFinish(false);
                        }
                    );
                } else {
                    if (!scope.remind.subject || scope.remind.subject === '') {
                        notify.error('exercizer.reminder.check.subject');
                    } else if (!scope.remind.body || scope.remind.body === '') {
                        notify.error('exercizer.reminder.check.body');
                    } else {
                        tracker && tracker.onStop();
                        SubjectCopyService.remindCustomCopies(copyIds, scope.remind.subject, scope.remind.body).then(
                            function () {
                                tracker && tracker.onFinish(true);
                                resetRemind();
                                scope.isDisplayed = false;
                                notify.info('exercizer.reminder.sent');
                            },
                            function (err) {
                                tracker && tracker.onFinish(false);
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
);
