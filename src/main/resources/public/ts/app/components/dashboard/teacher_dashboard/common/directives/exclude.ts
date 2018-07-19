import { ng, notify, _ } from 'entcore';

export const exclude = ng.directive('exclude', ['SubjectCopyService',(SubjectCopyService) => {
    return {
        restrict: 'E',
        scope: { 
            isDisplayed: "=",
            subjectCopyList: "=",
            selectedSubjectScheduled: "=",
            toasterDisplayed: "="
            
        },
        templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/common/templates/exclude.html',
        link: (scope:any, element, attrs) => {

            scope.confirmExclude = function() {
                var copyIds = [];
                angular.forEach(scope.subjectCopyList, function(copy){
                    if (copy.selected) copyIds.push(copy.id);
                });

                SubjectCopyService.excludeCopies(copyIds).then(
                    function (excludes) {
                        scope.close();
                        scope.toasterDisplayed.main = false;
                        scope.selectedSubjectScheduled.scheduled_at.exclude = scope.selectedSubjectScheduled.scheduled_at.exclude.concat(excludes);
                        scope.subjectCopyList = _.reject(scope.subjectCopyList, (copy) => {
                            return copy.selected;
                        });                       
                    },
                    function (err) {
                        notify.error(err);
                    }
                );
            };

            scope.close = function() {
                scope.isDisplayed = false;
            };
        }
    };
}]
);
