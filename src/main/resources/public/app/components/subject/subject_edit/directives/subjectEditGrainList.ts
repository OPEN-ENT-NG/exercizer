directives.push(
    {
        name: 'subjectEditGrainList',
        injections: ['DragService', 'GrainService', (DragService, GrainService:IGrainService) => {
            return {
                restrict: 'E',
                scope : {
                    subject: '=',
                    grainList: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-grain-list.html',
                link:(scope:any) => {
                    scope.dropTo = function (subject,$originalEvent){
                        var dataField = DragService.dropConditionFunction(subject, $originalEvent);
                        var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
                        GrainService.duplicate(originalItem, subject);
                    }
                }
            };
        }]
    }
);


