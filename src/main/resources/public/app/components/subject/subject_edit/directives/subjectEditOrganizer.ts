directives.push(
    {
        name: 'subjectEditOrganizer',
        injections:
            [
                'GrainTypeService',

                (
                    GrainTypeService
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-organizer.html',
                        link: (scope:any) => {
                            scope.grainList = [];
                            scope.isFolded = false;

                            scope.$on("E_REFRESH_GRAIN_LIST", function (event, grainList:IGrain[]) {
                                scope.grainList = grainList;
                            });

                            scope.toggle = function () {
                                scope.isFolded = !scope.isFolded;
                            };

                            scope.previewPerformSubjectCopy = function () {
                                scope.$emit("E_PREVIEW_PERFORM_SUBJECT_COPY");
                            };

                            scope.foldAllGrain = function () {
                                scope.$emit("E_FOLD_GRAIN_LIST");
                            };

                            scope.getGrainName = function (grain:IGrain) {
                                if (grain.grain_data && grain.grain_data.title) {
                                    return grain.grain_data.title;
                                } else {
                                    var grainType = GrainTypeService.getById(grain.grain_type_id);
                                    return grainType.public_name;
                                }
                            };

                            scope.reOrder = function () {
                                angular.forEach(scope.grainList, function(grainItem, key) {
                                    if(grainItem.order_by != parseFloat(grainItem.index) + 1){
                                        grainItem.order_by = parseFloat(grainItem.index) + 1;
                                        scope.$emit("E_UPDATE_GRAIN",grainItem);
                                    }
                                });
                            }
                        }
                    };
                }
            ]
    }
);
