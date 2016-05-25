directives.push(
    {
        name: 'subjectGrainListEdit',
        injections:
            [
                'E_REFRESH_GRAIN_LIST',
                (
                    E_REFRESH_GRAIN_LIST
                ) => {
                    return {
                        restrict: 'E',
                        scope : {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/templates/subject-grain-list-edit.html',
                        link:(scope:any) => {

                            scope.grainList = [];
                            
                            scope.$on(E_REFRESH_GRAIN_LIST + scope.subject.id, function(event, grainList:IGrain[]) {
                                scope.grainList = grainList;
                            });
                        }
                    };
                }
            ]
    }
);


