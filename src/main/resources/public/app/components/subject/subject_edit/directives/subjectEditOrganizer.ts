directives.push(
    {
        name: 'subjectEditOrganizer',
        injections: ['$rootScope', '$location', 'GrainTypeService', ($rootScope, $location, GrainTypeService:IGrainTypeService) => {
                    return {
                        restrict: 'E',
                        scope: {
                            subject: '=',
                            grainList: '='
                        },
                        templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-organizer.html',
                        link: (scope:any) => {
                            scope.isFolded = false;

                            scope.toggle = function () {
                                scope.isFolded = !scope.isFolded;
                            };

                            scope.previewPerformSubjectCopy = function () {
                                $location.path('/subject/copy/preview/perform/' + scope.subject.id + '/');
                            };

                            scope.foldAllGrain = function () {
                                $rootScope.$broadcast('E_FORCE_FOLDING_GRAIN');
                            };

                            scope.getGrainName = function (grain:IGrain) {
                                if (grain.grain_data && grain.grain_data.title) {
                                    return grain.grain_data.title;
                                } else {
                                    var grainType = GrainTypeService.getById(grain.grain_type_id);
                                    return grainType.public_name;
                                }
                            };

                            scope.getGrainIllustrationURL = function(grainTypeId:number) {
                                var grainType = GrainTypeService.getById(grainTypeId);
                                return '/exercizer/public/assets/illustrations/' + grainType.illustration + '.html';
                            };

                            scope.reOrder = function () {
                                angular.forEach(scope.grainList, function(grainItem) {
                                    if(grainItem.order_by != parseInt(grainItem.index) + 1){
                                        grainItem.order_by = parseInt(grainItem.index) + 1;
                                        scope.$emit('E_UPDATE_GRAIN', grainItem);
                                        // TODO UPDATE LIST
                                    }
                                });
                            }
                        }
                    };
                }
            ]
    }
);
