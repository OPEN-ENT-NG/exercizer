import { ng, $, _ } from 'entcore';
import { IconZone, CustomData } from '../models/CustomData';
import { transformX, transformY } from '../../zonetext/directives/zoneCommon';

export const editZoneImage = ng.directive('editZoneImage',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/zoneimage/templates/edit.html',
            link:(scope:any, element) => {

                element.on('stopDrag', '[draggable]', () => {
                    scope.updateGrain();
                });

                scope.displayState = {
                    editedIcon: {} as IconZone
                };

                if (!scope.grain.grain_data.custom_data) {
                    scope.grain.grain_data.custom_data = new CustomData();
                }
                else {
                    scope.grain.grain_data.custom_data = new CustomData(scope.grain.grain_data.custom_data);
                }

                scope.updateGrain = () => {
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };

                scope.editAnswer = (answer: IconZone, option) => {
                    let i = scope.grain.grain_data.custom_data.options.indexOf(answer.answer);
                    scope.grain.grain_data.custom_data.options.splice(i, 1);

                    scope.displayState.editedIcon.answer = option; 
                    scope.displayState.editZone = false;
                    scope.grain.grain_data.custom_data.options.push(option);
                    scope.updateGrain();
                };

                scope.editZone = (zone: IconZone) => {
                    scope.displayState.editZone = true;
                    if(zone){
                        scope.displayState.editedIcon = zone;
                    }
                    else{
                        scope.displayState.editedIcon = {
                            answer: ''
                        };
                    }
                };

                scope.addZone = (option?: string) => {
                    if(!option){
                        option = scope.displayState.editedIcon;
                    }
                    scope.grain.grain_data.custom_data.addZone(scope.displayState.editedIcon);
                    scope.displayState.editZone = false;
                    scope.updateGrain();
                };

                scope.addOption = (container: CustomData) => {
                    var option = '/workspace/document/' + scope.displayState.newOption._id;
                    if(!scope.displayState.editZone){
                        container.addZone({ answer: option });
                    }
                    else{
                        var i = container.options.indexOf(scope.displayState.editedIcon.answer);
                        container.options.splice(i, 1);
                        scope.displayState.editedIcon.answer = option;
                    }

                    container.options.push(option);
                    scope.updateGrain();
                };

                scope.removeOption = (container: CustomData, option: string) => {
                    let i = container.options.indexOf(option);
                    container.options.splice(i, 1);
                    let iconZone = _.findWhere(container.zones, { answer: option });
                    let j = container.zones.indexOf(iconZone);
                    container.zones.splice(j, 1);
                    
                    scope.updateGrain();
                };

                scope.removeZone = (zone: IconZone) => {
                    let container = scope.grain.grain_data.custom_data as CustomData;

                    let j = container.options.indexOf(zone.answer);
                    container.options.splice(j, 1);

                    let i = container.zones.indexOf(zone);
                    container.zones.splice(i, 1);
                    
                    scope.updateGrain();
                };

                scope.getResizedIconZoneX = function(x: number, reverseTransform: boolean): number
                {
                    return transformX("img.pick-file", x, reverseTransform);
                };

                scope.getResizedIconZoneY = function(y: number, reverseTransform: boolean): number
                {
                    return transformY("img.pick-file", y, reverseTransform);
                };
            }
        };
    }]
);