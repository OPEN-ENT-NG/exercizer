directives.push(
    {
        name: 'subjectEditGrainList',
        injections:
            ['DragService',
                (DragService
                ) => {
                    return {
                        restrict: 'E',
                        scope : {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-grain-list.html',
                        link:(scope:any) => {

                            scope.grainList = [];
                            
                            scope.$on("E_REFRESH_GRAIN_LIST", function(event, grainList:IGrain[]) {
                                scope.grainList = grainList;
                            });

                            scope.dropTo = function (item,$originalEvent){
                                var dataField = DragService.dropConditionFunction(item, $originalEvent);
                                var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
                                console.log(originalItem);
                            }
                        }
                    };
                }
            ]
    }
);


