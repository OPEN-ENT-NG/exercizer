directives.push(
    {
        name: 'editZoneText',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/zonetext/templates/edit.html',
                link:(scope:any, element: any) => {
                    element.on('stopDrag', '[draggable]', () => {
                        scope.updateGrain();
                    });

                    scope.displayState = {
                        editedTextZone: {
                            options: []
                        } as zonetext.TextZone
                    };

                    if (!scope.grain.grain_data.custom_data) {
                        scope.grain.grain_data.custom_data = new zonetext.CustomData();
                    }
                    else {
                        scope.grain.grain_data.custom_data = new zonetext.CustomData(scope.grain.grain_data.custom_data);
                    }

                    scope.updateGrain = () => {
                        scope.$emit('E_UPDATE_GRAIN', scope.grain);
                    };

                    scope.editZone = (zone: zonetext.TextZone) => {
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

                    scope.removeZone = (zone: zonetext.TextZone) => {
                        let container = scope.grain.grain_data.custom_data as zonetext.CustomData;
                        let i = container.zones.indexOf(zone);
                        container.zones.splice(i, 1);

                        scope.updateGrain();
                    };

                    scope.addOption = (container: zonetext.CustomData | zonetext.TextZone) => {
                        container.options.push(scope.displayState.newOption);
                        scope.displayState.editedTextZone.answer = scope.displayState.newOption;
                        scope.updateGrain();
                        scope.displayState.newOption = '';
                    };

                    scope.removeOption = (container: zonetext.CustomData | zonetext.TextZone, option: string) => {
                        let i = container.options.indexOf(option);
                        container.options.splice(i, 1);

                        if (container instanceof zonetext.CustomData) {
                            let zones = _.filter(container.zones, { answer: option });
                            zones.forEach((zone) => {
                                let j = container.zones.indexOf(zone);
                                container.zones.splice(j, 1);
                            });
                        }

                        scope.updateGrain();
                    };

                    scope.switchTo = (newType: string) => {
                        let customData = scope.grain.grain_data.custom_data as zonetext.CustomData;
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
                }
            };
        }]
    }
);