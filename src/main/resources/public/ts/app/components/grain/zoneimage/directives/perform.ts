import { ng, _ } from 'entcore';
import { CustomData, IconZone } from '../models/CustomData';
import { getResizedIconZoneX, getResizedIconZoneY, preloadImage } from '../../zonetext/directives/zoneCommon';

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
                scope.dragOptions = [];

                scope.$watch("grainCopy",function(newValue,oldValue) {
                    scope.init();
                });

                const selector = function(){ return `#${scope.grainCopy.id}-bckgrnd`; }
                scope.getResizedIconZoneX = (coord,reverse) => getResizedIconZoneX(selector(),coord,reverse);
                scope.getResizedIconZoneY = (coord,reverse) => getResizedIconZoneY(selector(),coord,reverse);

                scope.init = () => {
                    // Wait for the background image to get loaded before placing blocks upon it.
                    scope.bckgrndLoaded = false;
                    preloadImage(selector())
                    .then( dimensions => {
                        scope.bckgrndLoaded = true;
                        scope.$apply('bckgrndLoaded');  // This will allow the blocks to be placed on the background image.
                    })
                    .catch( () => { /*console.log("background image cannot be loaded.")*/ } );

                    scope.grainCopy.grain_copy_data.custom_copy_data = new CustomData(scope.grainCopy.grain_copy_data.custom_copy_data);
                    scope.customData = scope.grainCopy.grain_copy_data.custom_copy_data;

                    let tmp = _.clone(scope.customData.options);
                    let secureLoop = 0;
                    if (tmp && tmp.length > 1) {
                        while (scope.customData.options[0] === tmp[0] && !(secureLoop === 5)) {
                            scope.customData.options = _.shuffle(scope.customData.options);
                            secureLoop++;
                        }
                    }

                    scope.customData.options.forEach((option, index) => {
                        scope.dragOptions.push({id:index,option:option});
                    });

                    if (!scope.usedAnswers[scope.grainCopy.id]) {
                        scope.usedAnswers[scope.grainCopy.id] = [];
                        if (scope.grainCopy.grain_copy_data.custom_copy_data.zones) {

                            scope.grainCopy.grain_copy_data.custom_copy_data.zones.forEach((zone) => {
                                if (zone.answer) {
                                    for (let option of scope.dragOptions) {
                                        if (option.option === zone.answer && option.zoneId === undefined) {
                                            option.zoneId = zone.id;
                                            scope.usedAnswers[scope.grainCopy.id].push(option);
                                            break;
                                        }
                                    }
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

                scope.availableOption = (option) => scope.usedAnswers[scope.grainCopy.id].indexOf(option) === -1;

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

                let _selectedanswer;

                scope.showAnswers = function(element, iconZone) {
                    scope.showAnswersMobile = true;
                    $('.item-selected').removeClass('item-selected');
                    $(element.target).addClass('item-selected');
                    _selectedanswer = iconZone;
                }

                scope.selectAnswer = function(option) {
                    scope.removeAnswer(_selectedanswer);
                    scope.showAnswersMobile = false;
                    _selectedanswer.answer = option.option;
                    option.zoneId = _selectedanswer.id;
                    scope.usedAnswers[scope.grainCopy.id].push(option);
                    $('.item-selected').removeClass('item-selected');
                    scope.updateGrainCopy();
                }
            }
        };
    }]
);







