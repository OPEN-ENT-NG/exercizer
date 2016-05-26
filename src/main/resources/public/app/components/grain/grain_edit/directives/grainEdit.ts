directives.push(
    {
        name: 'grainEdit',
        injections: [ () => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/grain_edit/templates/grain-edit.html'
            };
        }]
    }
);
