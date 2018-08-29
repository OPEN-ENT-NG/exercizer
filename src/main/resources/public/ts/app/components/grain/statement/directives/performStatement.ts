import { ng } from 'entcore';
import { StatementCustomCopyData } from '../models/StatementCustomCopyData';

export const performStatement = ng.directive('performStatement',
    ['$sce', ($sce) => {
        return {
            restrict: 'E',
            scope : {
                grainCopy: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/statement/templates/perform-statement.html',
            link:(scope:any) => {
                scope.$watch('grainCopy', function(newValue, oldValue) {
                    if (angular.isUndefined(scope.grainCopy.grain_copy_data.custom_copy_data)) {
                        scope.grainCopy.grain_copy_data.custom_copy_data = new StatementCustomCopyData();
                        scope.grainCopy.grain_copy_data.custom_copy_data.statement = '';
                        scope.statementHtml = $sce.trustAsHtml(scope.grainCopy.grain_copy_data.custom_copy_data.statement);
                    } else if (angular.isUndefined(scope.grainCopy.grain_copy_data.custom_copy_data.statement)) {
                        scope.statementHtml = '';
                    } else {
                        scope.statementHtml = $sce.trustAsHtml(scope.grainCopy.grain_copy_data.custom_copy_data.statement);
                    }
                });
            }
        };
    }]
);

