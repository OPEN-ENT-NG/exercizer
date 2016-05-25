directives.push(
    {
        name: 'editGrain',
        injections: [ () => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/templates/edit-grain.html'
            };
        }]
    }
);
