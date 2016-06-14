directives.push(
    {
        name: 'grainEditToggleAside',
        injections: ['SubjectService', 'GrainService', (SubjectService:ISubjectService, GrainService:IGrainService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '=',
                    cellCount: '@'
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-toggle-aside.html',
                link: (scope:any) => {
                    
                    scope.isGrainSelected = function() {
                        var subject = SubjectService.getById(scope.grain.subject_id);
                        return GrainService.getSelectedListBySubject(subject).indexOf(scope.grain) !== -1;
                    };

                    scope.toggleGrainSelection = function() {
                        GrainService.select(scope.grain);
                    };
                }
            };
        }]
    }
);
