directives.push(
    {
        name: 'navSubjectPerform',
        injections: [ () => {
            return {
                restrict: 'E',
                scope :{
                    grainList : "=",
                    clickOnGrainCopyFromParent: '&'
                },
                templateUrl: 'exercizer/public/app/templates/directives/navSubjectPerform.html',
                link:(scope : any, element, attrs) => {

                    scope.clickOnGrainCopy = function(grainCopy){
                        scope.clickOnGrainCopyFromParent({grainCopy: grainCopy});
                    };

                    scope.isCurrent = function(){
                    }
                }
            };
        }]
    }
);
