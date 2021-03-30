import { ng, $, _ } from 'entcore';
import { CustomData, IconZone } from '../models/CustomData';
import { transformX, transformY } from '../../zonetext/directives/zoneCommon';

export const performZoneImage = ng.directive('performZoneImage',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainCopy: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/zoneimage/templates/perform.html',
            link: (scope: any) => {

                scope.usedAnswers = {};

                scope.$watch("grainCopy",function(newValue,oldValue) {
                    scope.init();
                });

                scope.init = () => {
                    scope.grainCopy.grain_copy_data.custom_copy_data = new CustomData(scope.grainCopy.grain_copy_data.custom_copy_data);
                    if (!scope.usedAnswers[scope.grainCopy.id]) {
                        scope.usedAnswers[scope.grainCopy.id] = [];
                        if (scope.grainCopy.grain_copy_data.custom_copy_data.zones) {
                            scope.grainCopy.grain_copy_data.custom_copy_data.zones.forEach((option) => {
                                if (option.answer && option.answer.length > 0) {
                                    scope.usedAnswers[scope.grainCopy.id].push(option.answer);
                                }
                            });
                        }
                    }
                };
                
                scope.availableAnswers = () => {
                    let returnArray = [];
                    scope.grainCopy.grain_copy_data.custom_copy_data.options.forEach((option) => {
                        let totalMatch = _.filter(scope.grainCopy.grain_copy_data.custom_copy_data.options, 
                            (o, i) => o === option
                        ).length;

                        let foundMatch = _.filter(returnArray, (o) => o === option).length;
                        let foundUsed = _.filter(scope.usedAnswers[scope.grainCopy.id], (o) => o === option).length;

                        if(foundUsed + foundMatch < totalMatch){
                            returnArray.push(option);
                        }
                    });
                    
                    return returnArray;
                };

                scope.updateGrainCopy = () => {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };

                scope.answer = (iconZone: IconZone, $item: string | IconZone) => {
                    if(typeof $item !== 'string'){
                        var currentAnswer = iconZone.answer;
                        scope.answer(iconZone, $item.answer);
                        scope.answer($item, currentAnswer);
                        return;
                    }

                    scope.removeAnswer(iconZone);
                    iconZone.answer = $item as string;
                    scope.usedAnswers[scope.grainCopy.id].push($item);
                    scope.updateGrainCopy();
                };

                scope.removeAnswer = ($item: IconZone) => {
                    if (!$item.answer) {
                        return;
                    }
                    var i = scope.usedAnswers[scope.grainCopy.id].indexOf($item.answer);
                    scope.usedAnswers[scope.grainCopy.id].splice(i, 1);
                    $item.answer = '';
                    scope.updateGrainCopy();
                };

                scope.getResizedIconZoneX = function(x: number, reverseTransform: boolean): number
                {
                    let selector = `#${scope.grainCopy.id}-bckgrnd`;
                    return transformX(selector, x, reverseTransform);
                };

                scope.getResizedIconZoneY = function(y: number, reverseTransform: boolean): number
                {
                    let selector = `#${scope.grainCopy.id}-bckgrnd`;
                    return transformY(selector, y, reverseTransform);
                };
            }
        };
    }]
);







