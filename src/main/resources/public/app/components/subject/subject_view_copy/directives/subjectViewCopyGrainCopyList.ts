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
                    scope.getGrainScheduled = function(grainCopy:IGrainCopy) {
                       /* var  grainScheduledListOrder = $filter('orderObjectBy')(scope.grainScheduledList, 'order_by', false);
                        return grainScheduledListOrder[scope.grainCopyList.indexOf(grainCopy)];*/
                        var result = scope.grainScheduledList.filter(function( obj ) {
                            return obj.id == grainCopy.grain_scheduled_id;
                        });
                        if(result.length === 1){
                            return result[0]
                        } else{
                            throw "grain Scheduled not found"
                        }
                    };
                }
            };
        }]
    }
);



