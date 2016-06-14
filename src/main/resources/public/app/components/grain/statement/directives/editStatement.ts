directives.push(
    {
        name: 'editStatement',
        injections: ['$sce', ($sce) => {
            return {
                restrict: 'E',
                scope : {
                    grain : '='
                },
                templateUrl: 'exercizer/public/app/components/grain/statement/templates/edit-statement.html',
                link:(scope:any, element:any) => {

                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        scope.grain.grain_data.custom_data = new StatementCustomData();
                        scope.grain.grain_data.custom_data.statement = '';
                        scope.statementHtml = $sce.trustAsHtml(scope.grain.grain_data.custom_data.statement);
                        scope.grain.grain_data.custom_data.statement = StringISOHelper.toISO(scope.grain.grain_data.statement);
                        scope.$emit('E_UPDATE_GRAIN', scope.grain);
                    }

                    scope.isFolded = false;

                    scope.$on('E_TOGGLE_GRAIN', function(event, grain:IGrain) {
                        if (grain.id === scope.grain.id) {
                            scope.statementHtml = $sce.trustAsHtml(scope.grain.grain_data.custom_data.statement);
                            scope.isFolded = !scope.isFolded;
                        }
                    });

                    scope.$on('E_FORCE_FOLDING_GRAIN', function() {
                        scope.statementHtml = $sce.trustAsHtml(scope.grain.grain_data.custom_data.statement);
                        scope.isFolded = true;
                    });

                    var isEditorFocus = false;

                    /**
                     * Event JQuery because no ng-blur on editor
                     */
                    element.find('editor').on('editor-focus', function(){
                        console.log('first call');
                        isEditorFocus = true;
                    });

                    /**
                     * Event JQuery because no ng-blur on editor
                     */
                    element.find('editor').on('editor-blur', function() {
                        console.log('second call');
                        if (isEditorFocus) {
                            isEditorFocus = false;
                            scope.grain.grain_data.custom_data.statement = StringISOHelper.toISO(scope.grain.grain_data.custom_data.statement);
                            scope.$emit('E_UPDATE_GRAIN', scope.grain);
                        }
                    });
                }
            };
        }
        ]
    }
);


