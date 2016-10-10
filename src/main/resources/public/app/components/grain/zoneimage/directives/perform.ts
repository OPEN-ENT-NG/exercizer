directives.push(
    {
        name: 'performZoneImage',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '=',
                    grainCopyList: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/zoneimage/templates/perform.html',
                link: (scope: any) => {
                    scope.grainCopy.grain_copy_data.custom_copy_data = new zoneimage.CustomData(scope.grainCopy.grain_copy_data.custom_copy_data);

                    scope.usedAnswers = [];
                    
                    scope.availableAnswers = () => {
                        let returnArray = [];
                        scope.grainCopy.grain_copy_data.custom_copy_data.options.forEach((option) => {
                            let totalMatch = _.filter(scope.grainCopy.grain_copy_data.custom_copy_data.options, 
                                (o, i) => o === option
                            ).length;

                            let foundMatch = _.filter(returnArray, (o) => o === option).length;
                            let foundUsed = _.filter(scope.usedAnswers, (o) => o === option).length;

                            if(foundUsed + foundMatch < totalMatch){
                                returnArray.push(option);
                            }
                        });
                        
                        return returnArray;
                    };

                    scope.updateGrainCopy = () => {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    };

                    scope.answer = (iconZone: zoneimage.IconZone, $item: string | zoneimage.IconZone) => {
                        if(typeof $item !== 'string'){
                            var currentAnswer = iconZone.answer;
                            scope.answer(iconZone, $item.answer);
                            scope.answer($item, currentAnswer);
                            return;
                        }

                        scope.removeAnswer(iconZone);
                        iconZone.answer = $item as string;
                        scope.usedAnswers.push($item);
                        scope.updateGrainCopy();
                    };

                    scope.removeAnswer = ($item: zoneimage.IconZone) => {
                        if (!$item.answer) {
                            return;
                        }
                        var i = scope.usedAnswers.indexOf($item.answer);
                        scope.usedAnswers.splice(i, 1);
                        $item.answer = '';
                        scope.updateGrainCopy();
                    };
                }
            };
        }]
    }
);







