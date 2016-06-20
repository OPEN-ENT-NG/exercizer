directives.push(
    {
        name: 'subjectViewCopyGrainCopyList',
        injections: ['$filter', ($filter) => {
            return {
                restrict: 'E',
                scope : {
                    subjectScheduled: '=',
                    subjectCopy: '=',
                    grainScheduledList: '=',
                    grainCopyList: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_view_copy/templates/subject-view-copy-grain-copy-list.html',
                link:(scope:any) => {
                    scope.getGrainScheduled = function(grainCopy:IGrain) {
                        var  grainScheduledListOrder = $filter('orderObjectBy')(scope.grainScheduledList, 'order_by', false);
                        return grainScheduledListOrder[scope.grainCopyList.indexOf(grainCopy)];
                    };
                }
            };
        }]
    }
);



