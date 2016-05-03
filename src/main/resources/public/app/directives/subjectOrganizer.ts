directives.push(
    {
        name: "subjectOrganizer",
        injections: [ () => {
            return {
                restrict: "E",
                templateUrl: 'exercizer/public/app/templates/directives/subjectOrganizer.html',
                link:(scope : any, element, attrs) => {
                }
            };
        }]
    }
);
