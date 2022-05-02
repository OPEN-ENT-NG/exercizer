import { ng, _ } from 'entcore';
import { TextZone, CustomData } from '../models/CustomData';
import { getResizedTextZoneX, getResizedTextZoneY, preloadImage } from './zoneCommon';

export const editZoneText = ng.directive('editZoneText',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/zonetext/templates/edit.html',
            link:(scope:any, element: any) => {
                element.on('stopDrag', '[draggable]', () => {
                    scope.updateGrain();
                });

                scope.displayState = {
                    editedTextZone: {
                        options: []
                    } as TextZone
                };

                scope.getResizedTextZoneX = (coord,reverse)=>getResizedTextZoneX(selector,coord,reverse);
                scope.getResizedTextZoneY = (coord,reverse)=>getResizedTextZoneY(selector,coord,reverse);

                // Wait for the background image to get loaded before placing blocks upon it.
                scope.bckgrndLoaded = false;
                const selector = `#${scope.grain.id}-bckgrnd > div > img.pick-file`;
                preloadImage(selector)
                .then( dimensions => {
                    scope.bckgrndLoaded = true;
                    scope.$apply('bckgrndLoaded');  // This will allow the blocks to be placed on the background image.
                })
                .catch( () => { /*console.log("background image cannot be loaded.")*/ } );

                if (!scope.grain.grain_data.custom_data) {
                    scope.grain.grain_data.custom_data = new CustomData();
                }
                else {
                    scope.grain.grain_data.custom_data = new CustomData(scope.grain.grain_data.custom_data);
                }

                scope.updateGrain = () => {
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };

                scope.editZone = (zone: TextZone) => {
                    scope.displayState.editZone = true;
                    if(zone){
                        scope.displayState.editedTextZone = zone;
                    }
                    else{
                        scope.displayState.editedTextZone = {
                            answer: '',
                            options: []
                        };
                    }
                };

                scope.addZone = () => {
                    scope.grain.grain_data.custom_data.addZone(scope.displayState.editedTextZone);
                    scope.displayState.editZone = false;
                    scope.updateGrain();
                };

                scope.removeZone = (zone: TextZone) => {
                    let container = scope.grain.grain_data.custom_data as CustomData;
                    let i = container.zones.indexOf(zone);
                    container.zones.splice(i, 1);

                    scope.updateGrain();
                };

                scope.addOption = (container: CustomData | TextZone) => {
                    container.options.push(scope.displayState.newOption);
                    scope.displayState.editedTextZone.answer = scope.displayState.newOption;
                    scope.updateGrain();
                    scope.displayState.newOption = '';
                };

                scope.addOptionIfNotEmpty = (container: CustomData | TextZone) => {
                    if (scope.displayState.newOption) {
                        scope.addOption(container);
                    }
                };

                scope.removeOption = (container: CustomData | TextZone, option: string) => {
                    let i = container.options.indexOf(option);
                    container.options.splice(i, 1);

                    if (container instanceof CustomData) {
                        let zones = _.filter(container.zones, { answer: option });
                        zones.forEach((zone) => {
                            let j = container.zones.indexOf(zone);
                            container.zones.splice(j, 1);
                        });
                    }

                    scope.updateGrain();
                };

                scope.switchTo = (newType: string) => {
                    let customData = scope.grain.grain_data.custom_data as CustomData;
                    if (newType === 'drag') {
                        customData.options = [];
                        customData.zones.forEach((zone) => {
                            customData.options.push(zone.answer);
                        });
                    }
                    if (newType === 'list') {
                        customData.zones.forEach((zone) => {
                            zone.options = JSON.parse(JSON.stringify(customData.options));
                        });
                    }
                    scope.updateGrain();
                };

                scope.previousOpen = null;
                scope.openTextZone = function($event): void
                {
                    $event.currentTarget.classList.add("textZoneOpen");
                    if(scope.previousOpen != null)
                        scope.previousOpen.classList.remove("textZoneOpen");
                    scope.previousOpen = $event.currentTarget == scope.previousOpen ? null : $event.currentTarget;
                }
            }
        };
    }]
);