directives.push(
    {
        name: 'subjectEditButtonAddNewGrain',
        injections: ['GrainService', (GrainService:IGrainService) => {
            return {
                restrict: 'E',
                scope: {
                    subject: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-button-add-new-grain.html',
                link:(scope:any) => {

                    scope.addNewGrain = function() {
                        var newGrain = new Grain();

                        newGrain.subject_id = scope.subject.id;
                        newGrain.grain_data = new GrainData();
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
