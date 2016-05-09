directives.push(
    {
        name: "grainToggle",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    grain: '=',
                },
                templateUrl: 'exercizer/public/app/templates/directives/common_grain/grainToggle.html',
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);