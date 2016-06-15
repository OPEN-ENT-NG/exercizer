directives.push(
    {
        name: 'subjectEditOrganizer',
        injections: ['$location', 'GrainTypeService', 'GrainService', 'SubjectEditService', ($location, GrainTypeService:IGrainTypeService, GrainService:IGrainService, SubjectEditService:ISubjectEditService) => {
            return {
                restrict: 'E',
                scope: {
                    subject: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-organizer.html',
                link: (scope:any) => {

                    scope.grainList = [];

                    GrainService.getListBySubject(scope.subject).then(
                        function(grainList:IGrain[]) {
                            scope.grainList = grainList;
                        },
                        function(err) {
                            notify.error(err);
                        }
                    );
                    
                    scope.isFolded = false;

                    scope.fold = function () {
                        scope.isFolded = !scope.isFolded;
                    };

                    scope.foldAllGrain = function () {
                        SubjectEditService.foldGrainListBySubjectId(scope.subject.id);
                    };

                    scope.previewPerformSubjectCopy = function () {
                        $location.path('/subject/copy/preview/perform/' + scope.subject.id + '/');
                    };

                    scope.getGrainIllustrationURL = function(grainTypeId:number):string {
                        return GrainTypeService.getIllustrationUrl(grainTypeId);
                    };

                    scope.getGrainName = function (grain:IGrain) {
                        if (grain.grain_data && grain.grain_data.title) {
                            return grain.grain_data.title;
                        } else {
                            var grainType = GrainTypeService.getById(grain.grain_type_id);
                            return grainType.public_name;
                        }
                    };

                    scope.reOrder = function() {
                        angular.forEach(scope.grainList, function(grainItem) {
                            if(grainItem.order_by != parseInt(grainItem.index) + 1){
                                grainItem.order_by = parseInt(grainItem.index) + 1;
                                GrainService.update(grainItem).then(
                                    function(grain:IGrain) {
                                        grainItem = grain;
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                )
                            }
                        });
                    }
                }
            };
        }]
    }
);
