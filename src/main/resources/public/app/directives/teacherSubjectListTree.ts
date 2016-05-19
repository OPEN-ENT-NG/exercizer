directives.push(
    {
        name: 'teacherSubjectListTree',
        injections: ['GrainService', (GrainService) => {
            return {
                restrict: 'E',
                scope: {
                    subjectList: "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/teacherSubjectListTree.html',
                link: (scope:any, element, attrs) => {

                    /**
                     * GRAIN LIST
                     */
                    scope.itemListBySubjectId = function (subjectId) {
                            return GrainService.grainListBySubjectId(subjectId);
                    };

                    scope.getItemLabel = function (item) {
                        return GrainService.getGrainLabel(item);
                    };

                    /**
                     * TOGGLE DISPLAY
                     */

                    scope.toggleDisplayMySubjectList = function () {
                        scope.display.mySubjectList = !scope.display.mySubjectList;
                    };

                    scope.toggleDisplaySubjectById = function(id) {
                        scope.display.subjectById[id] = scope.display.subjectById[id] ? !scope.display.subjectById[id] : true;
                    };

                    /**
                     * DISPLAY
                     */
                    scope.display = {
                        mySubjectList: false,
                        subjectById : []
                    }
                }
            };
        }]
    }
);
