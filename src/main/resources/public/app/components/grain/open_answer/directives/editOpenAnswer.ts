directives.push(
    {
        name: 'editOpenAnswer',
        injections: ['SubjectEditService', (SubjectEditService:ISubjectEditService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/open_answer/templates/edit-open-answer.html',
                link:(scope:any) => {

                    scope.isGrainFolded = function() {
                        return SubjectEditService.isGrainFolded(scope.grain);
                    };
                }
            };
        }
        ]
    }
);






