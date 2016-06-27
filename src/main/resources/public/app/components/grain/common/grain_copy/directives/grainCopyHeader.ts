directives.push(
    {
        name: 'grainCopyHeader',
        injections: ['GrainTypeService', (GrainTypeService) => {
            return {
                restrict: 'E',
                scope : {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_copy/templates/grain-copy-header.html',
                link:(scope:any) => {
                    scope.grainType = GrainTypeService.getById(scope.grainCopy.grain_type_id);
                    scope.isAnswerHintFolded = true;
                    
                    scope.hasAnswerHint = function() {
                        return !angular.isUndefined(scope.grainCopy.grain_copy_data.answer_hint) && scope.grainCopy.grain_copy_data.answer_hint  !== null;
                    };
                    
                    scope.toggleGrainCopyHint = function() {
                        scope.isAnswerHintFolded = !scope.isAnswerHintFolded;
                    }
                }
            };
        }]
    }
);
