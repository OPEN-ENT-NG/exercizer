import { ng } from 'entcore';
import { StatementCustomData } from '../models/StatementCustomData';
import { StringISOHelper } from '../../../../models/helpers';

export const editStatement = ng.directive('editStatement',
    [() => {
        return {
            restrict: 'E',
            scope : {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/statement/templates/edit-statement.html',
            link:(scope:any, element:any) => {

                if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                    scope.grain.grain_data.custom_data = new StatementCustomData();
                    scope.grain.grain_data.custom_data.statement = '';
                }

                scope.updateGrain = () => {
                    scope.grain.grain_data.custom_data.statement = StringISOHelper.toISO(scope.grain.grain_data.custom_data.statement);
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };
            }
        };
    }]
);


