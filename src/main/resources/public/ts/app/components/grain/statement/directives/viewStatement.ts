import { ng } from 'entcore';
import { StatementCustomCopyData } from '../models/StatementCustomCopyData';

export const viewStatement = ng.directive('viewStatement',
    ['$sce', ($sce) => {
        return {
            restrict: 'E',
            scope : {
                grainCopy: '=',
                grainCopyList: '=',
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/statement/templates/view-statement.html',
            link:(scope:any) => {
                if (angular.isUndefined(scope.grainCopy.grain_copy_data.custom_copy_data)) {
                    scope.grainCopy.grain_copy_data.custom_copy_data = new StatementCustomCopyData();
                    scope.grainCopy.grain_copy_data.custom_copy_data.statement = '';
                    scope.statementHtml = $sce.trustAsHtml(scope.grainCopy.grain_copy_data.custom_copy_data.statement);
                } else if (angular.isUndefined(scope.grainCopy.grain_copy_data.custom_copy_data.statement)) {
                    scope.statementHtml = '';
                } else {
                    scope.statementHtml = $sce.trustAsHtml(scope.grainCopy.grain_copy_data.custom_copy_data.statement);
                }
            }
        };
    }]
);