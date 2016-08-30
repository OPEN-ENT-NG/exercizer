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
                link:(scope:any, element) => {

                    element.on('stopDrag', '[draggable]', () => {
                        scope.updateGrain();
                    });

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
                        let iconsZone = _.filter(container.zones, { answer: option });
                        iconsZone.forEach((icon) => {
                            let j = container.zones.indexOf(icon);
                            container.zones.splice(j, 1);
                        });
                        
                        scope.updateGrain();
                    };

                    scope.removeZone = (zone: zoneimage.IconZone) => {
                        let container = scope.grain.grain_data.custom_data as zoneimage.CustomData;
                        let i = container.zones.indexOf(zone);
                        container.zones.splice(i, 1);
                        
                        scope.updateGrain();
                    };
                }
            };
        }]
    }
);