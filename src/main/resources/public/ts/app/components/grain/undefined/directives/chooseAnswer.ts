import { ng } from 'entcore';
import { IGrainType } from '../../../../models/domain/GrainType';
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

                scope.getGrainIllustrationURL = function(grainType:IGrainType) {
                    return `exercizer/public/assets/icons/illustrations.svg#${grainType.name}`
                };

                scope.displayNextStep = function(grainTypeId:number) {
                    scope.grain.grain_type_id = grainTypeId;
                    scope.grain.grain_data.title = '';
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                }

                const preferedGrainOrder = {
                    1: /*choose*/               10,
                    2: /*choose-answer*/        20,
                    7: /*edit-qcm*/             30,
                    4: /*edit-simple-answer*/   40,
                    6: /*edit-multiple-answer*/ 50,
                    5: /*edit-open-answer*/     60,
                    8: /*edit-association*/     70,
                    9: /*edit-order*/           80,
                    10: /*edit-fill-text*/      90,
                    11: /*edit-zone-text*/      100,
                    12: /*edit-zone-image*/     110,
                    3: /*edit-statement*/       120,
                }
                scope.grainSortOrder = function(grainTypeId1:{value:number}, grainTypeId2:{value:number}) {
                    return preferedGrainOrder[grainTypeId1.value] - preferedGrainOrder[grainTypeId2.value];
                }
            }
        };
    }]
);

