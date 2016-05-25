directives.push(
    {
        name: 'addNewGrain',
        injections:
            [
                'E_ADD_GRAIN',
                (
                    E_ADD_GRAIN
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/partials/templates/add-new-grain.html',
                        link:(scope:any) => {

                            scope.addNewGrain = function() {
                                var newGrain = new Grain();

                                newGrain.subject_id = scope.subject.id;
                                newGrain.grain_data = new GrainData();
                                newGrain.grain_type_id = 1;

                                scope.$emit(E_ADD_GRAIN + scope.subject.id, newGrain);
                            };
                        }
                    };
                }]
    }
);
