directives.push(
    {
        name: 'subjectEditOrganizer',
        injections: ['$location', 'GrainTypeService', ($location, GrainTypeService) => {
            return {
                restrict: 'E',
                scope: {
                    subject: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-organizer.html',
                link: (scope:any) => {
                    scope.grainList = [];
                    scope.currentReOrderIteration = 0;
                    scope.isFolded = false;

                    scope.$on('E_REFRESH_GRAIN_LIST', function (event, grainList:IGrain[]) {
                        scope.grainList = grainList;
                        scope.currentReOrderIteration = 0;
                        
                    });

                    scope.toggle = function () {
                        scope.isFolded = !scope.isFolded;
                    };

                    scope.previewPerformSubjectCopy = function () {
                        $location.path('/subject/copy/preview/perform/' + scope.subject.id + '/');
                    };

                    scope.foldAllGrain = function () {
                        scope.$emit('E_FOLD_GRAIN_LIST');
                    };

                    scope.getGrainIllustrationURL = function(grainTypeId:number) {
                       return GrainTypeService.getGrainIllustrationURL(grainTypeId);
                    };

                    scope.reOrder = function () {
                        angular.forEach(scope.grainList, function(grainItem) {
                            if(grainItem.order_by != parseFloat(grainItem.index) + 1){
                                grainItem.order_by = parseFloat(grainItem.index) + 1;
                            }
                        });
                        
                        scope.currentReOrderIteration += 1;
                    };

                    scope.$watch('currentReOrderIteration', function() {
                        if (scope.currentReOrderIteration === scope.grainList.length) {

                            angular.forEach(scope.grainList, function(grainItem) {
                                delete grainItem.index;
                            });

                            console.log('reOrder');
                            console.log(scope.grainList);

                            scope.$emit('E_UPDATE_GRAIN_LIST', scope.grainList);
                        }
                    });
                }
            };
        }]
    }
);