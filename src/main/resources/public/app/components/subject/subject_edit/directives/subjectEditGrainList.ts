directives.push(
    {
        name: 'subjectEditGrainList',
        injections: ['DragService', 'GrainService', 'GrainTypeService', (DragService, GrainService:IGrainService, GrainTypeService:IGrainTypeService) => {
            return {
                restrict: 'E',
                scope : {
                    subject: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-grain-list.html',
                link:(scope:any) => {
                    
                    scope.grainList = [];
                    
                    GrainService.getListBySubject(scope.subject).then(
                        function(grainList:IGrain[]) {
                            scope.grainList = grainList;
                        },
                        function(err) {
                            notify.error(err);
                        }
                    );
                    
                    scope.dropTo = function (subject,$originalEvent){
                        var dataField = DragService.dropConditionFunction(subject, $originalEvent);
                        var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
                        GrainService.duplicate(originalItem, subject);
                    };

                    scope.addGrain = function() {
                        var newGrain = new Grain();

                        newGrain.subject_id = scope.subject.id;
                        newGrain.grain_data = new GrainData();
                        newGrain.grain_data.title = GrainTypeService.getById(1).public_name;
                        newGrain.grain_type_id = 1;

                        GrainService.persist(newGrain).then(
                            function () {},
                            function (err) {
                                notify.error(err);
                            }
                        );
                    };
                }
            };
        }]
    }
);
