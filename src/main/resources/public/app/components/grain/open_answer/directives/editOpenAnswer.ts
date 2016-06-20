directives.push(
    {
        name: 'editOpenAnswer',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/open_answer/templates/edit-open-answer.html'
            };
        }]
    }
);






