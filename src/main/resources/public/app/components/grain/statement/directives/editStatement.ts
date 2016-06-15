directives.push(
    {
        name: 'editStatement',
        injections: ['$sce', 'GrainService', 'SubjectEditService', ($sce, GrainService:IGrainService, SubjectEditService:ISubjectEditService) => {
            return {
                restrict: 'E',
                scope : {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/statement/templates/edit-statement.html',
                link:(scope:any, element:any) => {

                    scope.isGrainFolded = function() {
                        return SubjectEditService.isGrainFolded(scope.grain);
                    };

                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        scope.grain.grain_data.custom_data = new StatementCustomData();
                        scope.grain.grain_data.custom_data.statement = '';
                        scope.statementHtml = $sce.trustAsHtml(scope.grain.grain_data.custom_data.statement);
                        scope.grain.grain_data.custom_data.statement = StringISOHelper.toISO(scope.grain.grain_data.statement);
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


