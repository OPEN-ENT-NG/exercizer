directives.push(
    {
        name: 'subjectViewCopyGrainCopyList',
        injections: [() => {
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
                        return scope.grainScheduledList[scope.grainCopyList.indexOf(grainCopy)];
                    };
                }
            };
        }]
    }
);



