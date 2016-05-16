directives.push(
    {
        name: "subjectOrganizer",
        injections: [ 'PreviewSubjectService','$rootScope','GrainService', (PreviewSubjectService,$rootScope, GrainService) => {
            return {
                restrict: "E",
                scope : {
                  subject : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/subjectOrganizer.html',
                link:(scope : any, element, attrs) => {

                    function init(){
                        scope.grainList = GrainService.grainListBySubjectId(scope.subject.id);
                    }
                    init();


                    scope.clickOnShowPreview = function(){
                        PreviewSubjectService.initPreviewSubject();
                    };

                    scope.clickOnAllToggle = function(){
                        $rootScope.$broadcast('TOGGLE_ALL_GRAIN', null);
                    };

                    scope.getGrainLabel = function(grain){
                        return GrainService.getGrainLabel(grain);
                    };

                    scope.initSortable = function(){
                        var  containerSortable = document.getElementById("sortable");
                        console.log('containerSortable', containerSortable);
                        containerSortable.sortable();
                        containerSortable.disableSelection();
                    };





                }
            };
        }]
    }
);
