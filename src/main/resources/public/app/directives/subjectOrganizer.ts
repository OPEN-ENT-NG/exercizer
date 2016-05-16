directives.push(
    {
        name: "subjectOrganizer",
        injections: [ 'PreviewSubjectService','$rootScope', (PreviewSubjectService,$rootScope) => {
            return {
                restrict: "E",
                templateUrl: 'exercizer/public/app/templates/directives/subjectOrganizer.html',
                link:(scope : any, element, attrs) => {

                    scope.clickOnShowPreview = function(){
                        PreviewSubjectService.initPreviewSubject();
                    };

                    scope.clickOnAllToggle = function(){
                        $rootScope.$broadcast('TOGGLE_ALL_GRAIN', null);
                    }
                }
            };
        }]
    }
);
