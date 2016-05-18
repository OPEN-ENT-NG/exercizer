directives.push(
    {
        name: 'subjectListTree',
        injections: [ () => {
            return {
                restrict: 'E',
                templateUrl: 'exercizer/public/app/templates/directives/subjectListTree.html',
                link:(scope : any, element, attrs) => {
                    scope.showCreateFolder = attrs.showCreateFolder === 'true';


                    scope.displaySubjectContent = false;

                    scope.toggleDisplaySubjectContent = function(){
                        scope.displaySubjectContent = ! scope.displaySubjectContent;
                    }

                    
                    
                }
            };
        }]
    }
);
