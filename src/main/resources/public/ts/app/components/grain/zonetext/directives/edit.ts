import { ng, $, _ } from 'entcore';
import { TextZone, CustomData } from '../models/CustomData';
import { getResizedTextZoneX, getResizedTextZoneY, preloadImage } from './zoneCommon';
class LightboxPromise {
    isVisible: boolean = false;
    private _resolution?: (value: Boolean | PromiseLike<Boolean>) => void;
	private _rejection?: (reason?: any) => void;
    display() {
        this.isVisible = true;
        return new Promise<Boolean>((_resolve, _reject) => {
            this._resolution = _resolve;
            this._rejection = _reject;
        });
    }
    private hide() {
        this.isVisible = false;
    }
    confirm() {
        this.hide();
        this._resolution && this._resolution(true);
    }
    cancel() {
        this.hide();
        this._resolution && this._resolution(false);
    }
    dismiss() {
        this.hide();
        this._rejection && this._rejection();
    }
}
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

                scope.$watch("grain.grain_data.custom_data.zones", function(newValue, oldValue) {
                    element.find('article').each((i, item) => {
                        $(item).on('click', () => {
                            $('.textZoneOpen').removeClass('textZoneOpen');
                            $(item).addClass('textZoneOpen');
                        })
                    });
                },true);

                scope.boxOnChange = new LightboxPromise();

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

                    if (container.options.length === 1) {
                        scope.displayState.editedTextZone.answer = scope.displayState.newOption
                    }

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

                scope.answersType = scope.grain.grain_data.custom_data.answersType;

                scope.switchTo = async (newType: string) => {
                    const customData = scope.grain.grain_data.custom_data as CustomData;
                    const applyChange = () => {
                        scope.grain.grain_data.custom_data.answersType = newType;
                        if (newType === 'drag') {
                            customData.options = [];
                            customData.zones.forEach((zone) => {
                                customData.options.push(zone.answer);
                            });
                        }
                        if (newType === 'list') {
                            if(customData.options.length > 0){
                                customData.zones.forEach((zone) => {
                                    zone.options = JSON.parse(JSON.stringify(customData.options));
                                });
                            }
                            else{
                                customData.zones.forEach((zone) => {
                                    zone.options = [zone.answer];
                                });
                            }
                        }
                        scope.updateGrain();
                    }
                    // #WB-460 Check whether to apply the change immediately, or ask for a validation before.
                    if( newType !== scope.grain.grain_data.custom_data.answersType && customData.zones.length ) {
                        // Ask for a validation
                        const ok = await scope.boxOnChange.display().catch( () => false );
                        if( ok ) {
                            applyChange();
                        } else {
                            scope.answersType = scope.grain.grain_data.custom_data.answersType;
                        }
                    } else {
                        // Apply the change immediately
                        applyChange();
                    }
                };
            }
        };
    }]
);