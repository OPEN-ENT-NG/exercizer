directives.push(
    {
        name: 'customEditor',
        injections: [() => {
            return {
                restrict: 'E',
                replace : true,
                scope : {
                    text :"=",
                    grain : "="
                },
                templateUrl: 'exercizer/public/app/components/grain/common/editor/editor.html',
                link:(scope:any, element) => {

                    scope.textEditor = scope.text;

                    scope.update = () => {
                        scope.text = StringISOHelper.toISO(scope.textEditor);
                        scope.$apply();
                        scope.$emit('E_UPDATE_GRAIN', scope.grain);
                    };
                }
            };
        }]
    }
);
