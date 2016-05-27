directives.push(
    {
        name: 'subjectEditGrainList',
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
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-grain-list.html',
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


