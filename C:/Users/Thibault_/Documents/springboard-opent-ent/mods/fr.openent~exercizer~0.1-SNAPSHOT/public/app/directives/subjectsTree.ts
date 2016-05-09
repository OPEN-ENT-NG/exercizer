directives.push(
    {
        name: 'subjectsTree',
        injections: [ () => {
            return {
                restrict: 'E',
                templateUrl: 'exercizer/public/app/templates/directives/subjectsTree.html',
                link:(scope : any, element, attrs) => {
                    scope.showCreateFolder = attrs.showCreateFolder === 'true';
                }
            };
        }]
    }
);
