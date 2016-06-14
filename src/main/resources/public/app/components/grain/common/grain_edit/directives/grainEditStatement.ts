directives.push(
    {
        name: 'grainEditStatement',
        injections: ['GrainService', (GrainService:IGrainService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-statement.html',
                link:(scope:any, element:any) => {

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
                    element.find('editor').on('editor-blur', function(){
                        if (isEditorFocus) {
                            isEditorFocus = false;
                            scope.grain.grain_data.statement = StringISOHelper.toISO(scope.grain.grain_data.statement);
                            GrainService.update(scope.grain).then(
                                function(grain:IGrain) {
                                    scope.grain = grain;
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
