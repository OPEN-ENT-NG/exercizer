directives.push(
    {
        name: 'performOpenAnswer',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/open_answer/templates/perform-open-answer.html',
                link:(scope:any, element : any, attrs) => {

                    var isEditorFocus = false;

                    scope.updateGrainCopy = function() {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    };

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
                        if(isEditorFocus){
                            isEditorFocus = false;
                            scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer = StringISOHelper.toISO(scope.grainCopy.grain_copy_data.custom_copy_data.filled_answer);
                            scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                        }
                    });
                }
            };
        }]
    }
);







