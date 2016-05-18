directives.push(
    {
        name: 'subjectTree',
        injections: ['GrainService', 'GrainCopyService', (GrainService, GrainCopyService) => {
            return {
                restrict: 'E',
                scope: {
                    subject: "=",
                    subjectCopy: "=",
                    clickOnGrainCopyFromParent: '&'

                },
                templateUrl: 'exercizer/public/app/templates/directives/widget/subjectTree.html',
                link: (scope:any, element, attrs) => {

                    var _selectedGrain = null;

                    // grain could be 'grain' or 'grain copy'
                    scope.grainList = function () {
                        if (scope.subject) {
                            return GrainService.grainListBySubjectId(scope.subject.id);
                        }
                        if (scope.subjectCopy) {
                            return GrainCopyService.grainCopyListBySubjectCopyId(scope.subjectCopy.id);
                        }
                    };

                    scope.getGrainLabel = function (grain) {
                        if (scope.subject) {
                            return GrainService.getGrainLabel(grain);
                        }
                        if (scope.subjectCopy) {
                            return GrainCopyService.getGrainCopyLabel(grain);
                        }
                    };

                    scope.isSelected = function (grain) {
                        if (_selectedGrain && _selectedGrain.id == grain.id) {
                            return 'selected';
                        } else {
                            return null;
                        }
                    };

                    scope.clickOnGrain = function (grain) {
                        _selectedGrain = grain;
                        if (scope.subjectCopy) {
                            scope.clickOnGrainCopyFromParent({grainCopy: grain});
                        }
                    };

                }
            };
        }]
    }
);
