directives.push(
    {
        name: 'subjectEditToaster',
        injections: ['$rootScope', 'GrainService', ($rootScope, GrainService:IGrainService) => {
            return {
                restrict: 'E',
                scope: {
                    subject: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-toaster.html',
                link:(scope:any) => {

                    scope.isDisplayed = false;
                    scope.isRemoveSelectedGrainModalDisplayed = false;
                    scope.selectedGrainList = [];
                    
                    // TODO display toaster method

                    scope.duplicateSelectedGrainList = function() {
                        GrainService.duplicateList(scope.selectedGrainList, scope.subject).then(
                            function() {
                                scope.isDisplayed = false;
                                scope.selectedGrainList = [];
                                $rootScope.$broadcast('E_GRAIN_DESELECT_ALL');
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };

                    scope.confirmRemoveSelectedGrainList = function() {
                        GrainService.removeList(scope.selectedGrainList, scope.subject).then(
                            function() {
                                scope.isDisplayed = false;
                                scope.isRemoveSelectedGrainModalDisplayed = false;
                                scope.selectedGrainList = [];
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    };

                    scope.$on('E_GRAIN_TOGGLED', function(event, grain:IGrain) {
                        var grainIndex = scope.selectedGrainList.indexOf(grain);
                        if (grainIndex !== -1) {
                            scope.selectedGrainList.splice(grainIndex, 1);
                        } else {
                            scope.selectedGrainList.push(grain);
                            scope.selectedGrainList.sort(function(grainA:IGrain, grainB:IGrain) {
                                return grainA.order_by - grainB.order_by;
                            });
                        }

                        scope.isDisplayed = scope.selectedGrainList.length > 0;
                    });
                }
            };
        }]
    }
);


