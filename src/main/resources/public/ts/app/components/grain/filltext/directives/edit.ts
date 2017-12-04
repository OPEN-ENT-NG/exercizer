import { ng, RTE } from 'entcore';
import { _ } from 'entcore';
import { TextZone, CustomData } from '../models/CustomData';
import { $ } from 'entcore';

let addEditorOption = () => {
    RTE.baseToolbarConf.option('filltext', function (instance) {
        return {
            template: '<i ng-click="editZone();" tooltip="editor.option.filltext"></i>' +
            '<lightbox show="displayState.editZone" on-close="displayState.editZone = false;">' +
            '<div ng-include="path"></div>' +
            '</lightbox>',
            link: function (scope, element, attributes) {
                scope.$watch(() => {
                    return scope.$eval('customData.answersType');
                }, (newVal) => {
                    scope.path = '/exercizer/public/ts/app/components/grain/filltext/templates/editor/' + newVal + '.html';
                });

                scope.addElement = function (zone: TextZone) {
                    instance.addState(instance.editZone.html());

                    let el = $(
                        instance.compile(
                            $('<span><fill-zone zone-id="' + zone.id + '"></fill-zone>&nbsp;</span>')[0].outerHTML
                        )(scope)
                    );

                    if (instance.selection.range) {
                        instance.selection.range.deleteContents();
                        instance.selection.range.insertNode(el[0]);
                    }
                    else {
                        instance.selection.editZone.append(el);
                    }

                    instance.trigger('contentupdated');
                    setTimeout(() => $('editor').trigger('save'), 500);
                };
            }
        }
    });
};

export const editFillText = ng.directive('editFillText',
    [() => {
        addEditorOption();

        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/filltext/templates/edit.html',
            link:(scope:any, element: any) => {
                scope.displayState = {
                    editZone: false,
                    editedTextZone: {
                        options: []
                    } as TextZone
                };

                element.on('editor-blur, save', 'editor', () => {
                    var dropZones = [];

                    element.find('[contenteditable] fill-zone').each((i, zoneEl) => {
                        if ($(zoneEl).find('input').length === 0) {
                            zoneEl.remove();
                        }
                    });

                    scope.customData.zones.forEach((zone) => {
                        let found = false;
                        element.find('[contenteditable] fill-zone').each((i, zoneEl) => {
                            if (parseInt($(zoneEl).attr('zone-id')) === zone.id) {
                                found = true;
                            }
                        });
                        if (!found) {
                            dropZones.push(zone);
                        }
                    });
                    dropZones.forEach((zone) => {
                        scope.customData.removeZone(zone);
                    });
                    
                    scope.updateGrain();
                });

                if (!scope.grain.grain_data.custom_data) {
                    scope.grain.grain_data.custom_data = new CustomData();
                }
                else {
                    scope.grain.grain_data.custom_data = new CustomData(scope.grain.grain_data.custom_data);
                }

                scope.customData = scope.grain.grain_data.custom_data;

                scope.updateGrain = () => {
                    scope.$emit('E_UPDATE_GRAIN', scope.grain);
                };

                scope.editZone = (zone: number) => {
                    scope.displayState.editZone = true;
                    if(zone !== undefined){
                        scope.displayState.editedTextZone = _.findWhere(scope.customData.zones, { id: zone });
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
                    return scope.displayState.editedTextZone;
                };

                scope.addOption = (container: CustomData | TextZone) => {
                    container.options.push(scope.displayState.newOption);
                    scope.displayState.editedTextZone.answer = scope.displayState.newOption;
                    scope.updateGrain();
                    scope.displayState.newOption = '';
                };

                scope.removeOption = (container: CustomData | TextZone, option: string) => {
                    let i = container.options.indexOf(option);
                    container.options.splice(i, 1);
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
                };
            }
        };
    }]
);