import { ng } from 'entcore';
import { IGrainTypeService } from '../../../../services';

export const choose = ng.directive('choose',
    ['GrainTypeService', (GrainTypeService:IGrainTypeService) => {
        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/undefined/templates/choose.html',
            link:(scope:any) => {
                
                scope.displayNextStep = function(grainTypeId) {
                    scope.grain.grain_type_id = grainTypeId;
                    scope.grain.grain_data.title = "";
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                }
            }
        };
    }]
);

