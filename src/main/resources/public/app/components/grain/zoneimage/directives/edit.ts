directives.push(
    {
        name: 'editZoneImage',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/zoneimage/templates/edit.html',
                link:(scope:any) => {

                    scope.displayState = {
                        editedIcon: {} as zoneimage.IconZone
                    };

                    if (!scope.grain.grain_data.custom_data) {
                        scope.grain.grain_data.custom_data = new zoneimage.CustomData();
                    }
                    else {
                        scope.grain.grain_data.custom_data = new zoneimage.CustomData(scope.grain.grain_data.custom_data);
                    }

                    scope.updateGrain = () => {
                        scope.$emit('E_UPDATE_GRAIN', scope.grain);
                    };

                    scope.editZone = (zone: zoneimage.IconZone) => {
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

                    scope.addZone = () => {
                        scope.grain.grain_data.custom_data.addZone(scope.displayState.editedIcon);
                        scope.displayState.editZone = false;
                        scope.updateGrain();
                    };

                    scope.addOption = (container: zoneimage.CustomData) => {
                        var option = '/workspace/document/' + scope.displayState.newOption._id;
                        container.addZone({ answer: option });
                        container.options.push(option);
                        scope.displayState.editedIcon.answer = scope.displayState.newOption;
                        scope.updateGrain();
                    };

                    scope.removeOption = (container: zoneimage.CustomData, option: string) => {
                        var i = container.options.indexOf(option);
                        container.options.splice(i, 1);
                        var iconZone = _.findWhere(container.iconZones, { answer: option });
                        var j = container.iconZones.indexOf(iconZone);
                        container.iconZones.splice(j, 1);
                    };

                    scope.switchTo = (newType: string) => {
                        var customData = scope.grain.grain_data.custom_data as zonetext.CustomData;
                        if (newType === 'drag') {
                            customData.options = [];
                            customData.textZones.forEach((zone) => {
                                customData.options.push(zone.answer);
                            });
                        }
                        if (newType === 'list') {
                            customData.textZones.forEach((zone) => {
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