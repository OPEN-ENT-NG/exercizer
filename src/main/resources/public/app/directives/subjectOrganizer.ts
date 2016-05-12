directives.push(
    {
        name: "subjectOrganizer",
        injections: [ 'PreviewSubjectService', (PreviewSubjectService) => {
            return {
                restrict: "E",
                templateUrl: 'exercizer/public/app/templates/directives/subjectOrganizer.html',
                link:(scope : any, element, attrs) => {

                    scope.clickOnShowPreview = function(){
                        PreviewSubjectService.initPreviewSubject();
                    }
                }
            };
        }]
    }
);
