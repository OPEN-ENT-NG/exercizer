directives.push(
    {
        name: 'performZoneText',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    grainCopy: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/zonetext/templates/perform.html',
                link: (scope: any) => {
                    scope.grainCopy.grain_copy_data.custom_copy_data = new zonetext.CustomData(scope.grainCopy.grain_copy_data.custom_copy_data);

                    scope.usedAnswers = [];

                    scope.updateGrainCopy = () => {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    };

                    scope.answer = (textZone, $item: string) => {
                        scope.removeAnswer(textZone);
                        textZone.answer = $item;
                        scope.usedAnswers.push($item);
                    };

                    scope.removeAnswer = ($item: zonetext.TextZone) => {
                        if (!$item.answer) {
                            return;
                        }
                        var i = scope.usedAnswers.indexOf($item.answer);
                        scope.usedAnswers.splice(i, 1);
                    };

                    scope.availableOption = (option) => scope.usedAnswers.indexOf(option) === -1;
                }
            };
        }]
    }
);







