directives.push(
    {
        name: 'subjectOrganizer',
        injections:
            [
                'GrainTypeService',
                'E_FOLD_GRAIN_LIST',
                'E_REFRESH_GRAIN_LIST',
                (
                    GrainTypeService,
                    E_FOLD_GRAIN_LIST,
                    E_REFRESH_GRAIN_LIST
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/templates/subject-organizer.html',
                        link:(scope:any) => {
                            scope.grainList = [];

                            scope.$on(E_REFRESH_GRAIN_LIST + scope.subject.id, function(event, grainList:IGrain[]) {
                                scope.grainList = grainList;
                            });

                            scope.foldAllGrain = function() {
                                scope.$emit(E_FOLD_GRAIN_LIST + scope.subject.id);
                            };

                            scope.getGrainTypePublicName = function(grainTypeId:number) {
                                var grainType = GrainTypeService.getById(grainTypeId);
                                return grainType.public_name;
                            };
                        }
                    };
                }
            ]
    }
);
