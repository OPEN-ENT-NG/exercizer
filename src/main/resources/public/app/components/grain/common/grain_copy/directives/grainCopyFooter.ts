directives.push(
    {
        name: 'grainCopyFooter',
        injections: [() => {
            return {
                restrict: 'E',
                scope : {
                    grainScheduled: '=',
                    grainCopy: '=',
                    isTeacher: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/common/grain_copy/templates/grain-copy-footer.html',
                link:(scope:any) => {
                    scope.isFolded = true;
                    
                    if (angular.isUndefined(scope.grainCopy.final_score)) {
                        scope.grainCopy.final_score = angular.isUndefined(scope.grainCopy.calculated_score) ? 0 : scope.grainCopy.calculated_score;
                    }

                    scope.hasAnswerExplanation = function() {
                        return !angular.isUndefined(scope.grainScheduled.grain_data.answer_explanation);
                    };
                    
                    scope.hasComment = function() {
                        return !angular.isUndefined(scope.grainCopy.comment);
                    };

                    scope.toggle = function() {
                        scope.isFolded = !scope.isFolded;
                    };

                    scope.updateGrain = function() {
                        if (scope.isTeacher) {
                            scope.grainCopy.comment = StringISOHelper.toISO(scope.grainCopy.comment);
                            scope.$emit('E_UPDATE_GRAIN', scope.grain);
                        }
                    };
                }
            };
        }]
    }
);
