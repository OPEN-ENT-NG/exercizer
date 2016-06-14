directives.push(
    {
        name: 'editStatement',
        injections: ['$sce', 'GrainService', ($sce, GrainService:IGrainService) => {
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
                        scope.statementHtml = $sce.trustAsHtml(scope.grain.grain_data.custom_data.statement);
                        scope.grain.grain_data.custom_data.statement = StringISOHelper.toISO(scope.grain.grain_data.statement);
                    }

                    scope.isFolded = false;

                    scope.$watch(scope.isFolded, function(isFolded:boolean) {
                        scope.isFolded = isFolded;
                        scope.statementHtml = $sce.trustAsHtml(scope.grain.grain_data.custom_data.statement);
                    });

                    scope.$on('E_FORCE_FOLDING_GRAIN', function() {
                        scope.isFolded = true;
                    });

                    var isEditorFocus = false;

                    /**
                     * Event JQuery because no ng-blur on editor
                     */
                    element.find('editor').on('editor-focus', function(){
                        isEditorFocus = true;
                    });

                    /**
                     * Event JQuery because no ng-blur on editor
                     */
                    element.find('editor').on('editor-blur', function() {
                        if (isEditorFocus) {
                            isEditorFocus = false;
                            scope.grain.grain_data.custom_data.statement = StringISOHelper.toISO(scope.grain.grain_data.custom_data.statement);
                            GrainService.update(scope.grain).then(
                                function(grain:IGrain) {
                                    scope.grain = grain;
                                    scope.statementHtml = $sce.trustAsHtml(scope.grain.grain_data.custom_data.statement);
                                },
                                function(err) {
                                    notify.error(err);
                                }
                            );
                        }
                    });
                }
            };
        }]
    }
);


