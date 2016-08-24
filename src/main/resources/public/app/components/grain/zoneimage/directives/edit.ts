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

                    scope.addZone = (option?: string) => {
                        if(!option){
                            option = scope.displayState.editedIcon;
                        }
                        scope.grain.grain_data.custom_data.addZone(scope.displayState.editedIcon);
                        scope.displayState.editZone = false;
                        scope.updateGrain();
                    };

                    scope.addOption = (container: zoneimage.CustomData) => {
                        var option = '/workspace/document/' + scope.displayState.newOption._id;
                        if(!scope.displayState.editZone){
                            container.addZone({ answer: option });
                        }
                        else{
                            var i = container.options.indexOf(scope.displayState.editedIcon.answer);
                            container.options.splice(i, 1);
                            scope.displayState.editedIcon.answer = option;
                        }
                        if(container.options.indexOf(option) === -1){
                            container.options.push(option);
                        }
                        
                        scope.updateGrain();
                    };

                    scope.removeOption = (container: zoneimage.CustomData, option: string) => {
                        let i = container.options.indexOf(option);
                        container.options.splice(i, 1);
                        let iconsZone = _.filter(container.iconZones, { answer: option });
                        iconsZone.forEach((icon) => {
                            let j = container.iconZones.indexOf(icon);
                            container.iconZones.splice(j, 1);
                        });
                        
                        scope.updateGrain();
                    };

                    scope.removeZone = (zone: zoneimage.IconZone) => {
                        let container = scope.grain.grain_data.custom_data as zoneimage.CustomData;
                        let i = container.iconZones.indexOf(zone);
                        container.iconZones.splice(i, 1);
                        
                        scope.updateGrain();
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