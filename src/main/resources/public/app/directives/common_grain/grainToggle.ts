directives.push(
    {
        name: "grainToggle",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    isToggle :'='
                },
                templateUrl: 'exercizer/public/app/templates/directives/common_grain/grainToggle.html',
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);