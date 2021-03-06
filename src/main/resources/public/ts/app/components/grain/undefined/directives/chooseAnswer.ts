import { ng } from 'entcore';
import { IGrainTypeService } from '../../../../services';

export const chooseAnswer = ng.directive('chooseAnswer',
    ['GrainTypeService', (GrainTypeService:IGrainTypeService) => {
        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/undefined/templates/choose-answer.html',
            link:(scope:any) => {

                scope.grainTypeList = GrainTypeService.getList();

                scope.getGrainIllustrationURL = function(grainTypeId:number) {
                    return GrainTypeService.getIllustrationURL(grainTypeId);
                };

                scope.displayNextStep = function(grainTypeId:number) {
                    scope.grain.grain_type_id = grainTypeId;
                    scope.grain.grain_data.title = '';
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                }
            }
        };
    }]
);

