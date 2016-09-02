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


                    var isEditorFocus = false;

                    /**
                     * Event JQuery because no ng-blur on editor
                     */
                    element.find('editor').on('editor-focus', function() {
                        isEditorFocus = true;
                    });

                    /**
                     * Event JQuery because no ng-blur on editor
                     */
                    element.find('editor').on('editor-blur', function() {
                        if (isEditorFocus) {
                            isEditorFocus = false;
                            scope.text = StringISOHelper.toISO(scope.textEditor);
                            scope.$apply();
                            scope.$emit('E_UPDATE_GRAIN', scope.grain);
                        }
                    });

                }
            };
        }]
    }
);
