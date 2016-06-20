directives.push(
    {
        name: 'editStatement',
        injections: [() => {
            return {
                restrict: 'E',
                scope : {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/statement/templates/edit-statement.html',
                link:(scope:any, element:any) => {

                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        scope.grain.grain_data.custom_data = new StatementCustomData();
                        scope.grain.grain_data.custom_data.statement = '';
                    }
                    
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
                            scope.grain.grain_data.custom_data.statement = StringISOHelper.toISO(scope.grain.grain_data.custom_data.statement);
                            scope.$emit('E_UPDATE_GRAIN', scope.grain);
                        }
                    });
                }
            };
        }]
    }
);


