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
                    
                    scope.selectedGrainList = [];
                    scope.isToasterDisplayed = false;
                    
                    scope.handleGrainToggled = function(grain:IGrain) {
                        var grainIndex = scope.selectedGrainList.indexOf(grain);
                        if (grainIndex !== -1) {
                            scope.selectedGrainList.splice(grainIndex, 1);
                        } else {
                            scope.selectedGrainList.push(grain);
                            scope.selectedGrainList.sort(function(grainA:IGrain, grainB:IGrain) {
                                return grainA.order_by - grainB.order_by;
                            });
                        }
                        
                        if (scope.selectedGrainList > 0) {
                            scope.isToasterDisplayed = false;
                        }
                    };
                    
                    scope.handleGrainListDeselected = function() {
                        scope.selectedGrainList = [];
                        scope.isToasterDisplayed = false;
                    };
                    
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


