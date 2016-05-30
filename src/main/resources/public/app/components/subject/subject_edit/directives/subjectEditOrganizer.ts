directives.push(
    {
        name: 'subjectEditOrganizer',
        injections:
            [
                'GrainTypeService',
                'E_PREVIEW_PERFORM_SUBJECT_COPY',
                'E_FOLD_GRAIN_LIST',
                'E_REFRESH_GRAIN_LIST',
                (
                    GrainTypeService,
                    E_PREVIEW_PERFORM_SUBJECT_COPY,
                    E_FOLD_GRAIN_LIST,
                    E_REFRESH_GRAIN_LIST
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-organizer.html',
                        link:(scope:any) => {
                            scope.grainList = [];
                            scope.isFolded = false;

                            scope.$on(E_REFRESH_GRAIN_LIST + scope.subject.id, function(event, grainList:IGrain[]) {
                                scope.grainList = grainList;
                            });
                            
                            scope.toggle = function() {
                                scope.isFolded = !scope.isFolded;
                            };
                            
                            scope.previewPerformSubjectCopy = function() {
                                scope.$emit(E_PREVIEW_PERFORM_SUBJECT_COPY + scope.subject.id);
                            };

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
