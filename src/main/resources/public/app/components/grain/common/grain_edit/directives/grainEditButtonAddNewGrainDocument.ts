directives.push(
    {
        name: 'grainEditButtonAddNewGrainDocument',
        injections:
            [
                'E_ADD_GRAIN_DOCUMENT',
                (
                    E_ADD_GRAIN_DOCUMENT
                ) => {
                    return {
                        restrict: 'E',
                        scope: {
                            grain: '='
                        },
                        templateUrl: 'exercizer/public/app/components/grain/common/grain_edit/templates/grain-edit-button-add-new-grain-document.html',
                        link:(scope:any) => {
                            scope.addNewGrainDocument = function() {
                                scope.$emit(E_ADD_GRAIN_DOCUMENT + scope.grain.subject_id, scope.grain);
                            };
                        }
                    };
                }
            ]
    }
);