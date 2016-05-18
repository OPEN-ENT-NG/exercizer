directives.push(
    {
        name: "subjectOrganizer",
        injections: [ 'PreviewSubjectService','$rootScope','GrainService', (PreviewSubjectService,$rootScope, GrainService) => {
            return {
                restrict: "E",
                scope : {
                  subject : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/widget/subjectOrganizer.html',
                link:(scope : any, element, attrs) => {

                    function init(){
                        scope.grainList = GrainService.grainListBySubjectId(scope.subject.id);
                    }
                    init();


                    scope.clickOnShowPreview = function(){
                        PreviewSubjectService.initPreviewSubject();
                        $rootScope.$broadcast('RESET_SUBJECT_PERFORM', null);
                    };

                    scope.clickOnAllToggle = function(){
                        $rootScope.$broadcast('TOGGLE_ALL_GRAIN', null);
                    };

                    scope.getGrainLabel = function(grain){
                        return GrainService.getGrainLabel(grain);
                    };

                    scope.reOrder = function(grain){
                        angular.forEach(scope.grainList, function(grainItem, key) {
                            grainItem.order = parseFloat(grainItem.index) + 1;
                        });
                        console.log('grainList', scope.grainList);

                    };

                }
            };
        }]
    }
);
