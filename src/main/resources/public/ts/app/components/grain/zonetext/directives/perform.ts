import { ng, $, _ } from 'entcore';
import { CustomData, TextZone } from '../models/CustomData';
import { transformW, preloadImage, getResizedTextZoneX, getResizedTextZoneY } from './zoneCommon';

export const performZoneText = ng.directive('performZoneText',
    ['$timeout', ($timeout) => {
        return {
            restrict: 'E',
            scope: {
                grainCopy: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/zonetext/templates/perform.html',
            link: (scope: any) => {
                scope.$watch("grainCopy",function() {
                    scope.init();
                });

                const selector = function(){ return `#${scope.grainCopy.id}-bckgrnd`; }
                scope.getResizedTextZoneX = (coord,reverse)=>getResizedTextZoneX(selector(),coord,reverse);
                scope.getResizedTextZoneY = (coord,reverse)=>getResizedTextZoneY(selector(),coord,reverse);

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
                    if (scope.customData.answersType === 'drag') {
                        var tmp = _.clone(scope.customData.options);
                        var secureLoop = 0;
                        if (tmp && tmp.length > 1) {
                            while (scope.customData.options[0] === tmp[0] && !(secureLoop === 5)) {
                                scope.customData.options = _.shuffle(scope.customData.options);
                                secureLoop++;
                            }
                        }

                        scope.dragOptions = [];
                        var i=0;

                        _.forEach(scope.customData.options, function (option) {
                            scope.dragOptions.push({id:i,option:option});
                            i++;
                        });

                        //case of several fillZone in the same subject
                        scope.usedAnswers = [];

                        // init usedAnswers
                        if (scope.customData.zones) {
                            _.forEach(scope.customData.zones, function (zone) {
                                if (zone.answer) {
                                    for (let option of scope.dragOptions) {
                                        if (option.option === zone.answer && option.zoneId === undefined) {
                                            option.zoneId = zone.id;
                                            scope.usedAnswers.push(option);
                                            break;
                                        }
                                    }
                                }
                            });
                        }

                    }
                };

                scope.usedAnswers = [];

                scope.updateGrainCopy = () => {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };

                scope.answer = (textZone: TextZone, $item: string | TextZone) => {
                    scope.removeAnswer(textZone);
                    if (typeof $item == 'string') {
                        textZone.answer = $item;
                    } else {
                        textZone.answer = $item.answer;
                        $item.answer = '';
                    }
                    scope.usedAnswers.push($item);
                    scope.updateGrainCopy();
                };

                scope.removeAnswer = ($item: TextZone) => {
                    if (!$item.answer) {
                        return;
                    }
                    var i = scope.usedAnswers.indexOf($item.answer);
                    scope.usedAnswers.splice(i, 1);
                    $item.answer = '';
                    scope.updateGrainCopy();
                };

                scope.availableOption = (option) => scope.usedAnswers.indexOf(option) === -1;

                scope.apply = function (fn) {
                    //workaround for AngularJs bug https://github.com/angular/angular.js/issues/7692
                    //  Note 2022-03: since upgrade to v1.7.9, calling scope.$apply() seems to be throwing an error
                    //scope.$apply();
                    //  => use the "safeApply" tip instead.
                    var phase = scope.$root.$$phase;
                    if(phase == '$apply' || phase == '$digest') {
                        if(fn && (typeof(fn) === 'function')) {
                            fn();
                        }
                    } else {
                        scope.$apply(fn);
                    }
                    scope.updateGrainCopy();
                };

                scope.getResizedTextZoneW = function(w: number, reverseTransform: boolean): number
                {
                    let selector = `#${scope.grainCopy.id}-bckgrnd`;
                    let trans = transformW(selector, w, reverseTransform);
                    $(".base-image > article > text-zone").css({
                        width: trans
                    });
                    return trans;
                };

                scope.previousOpen = null;
                scope.openTextZone = function($event): void
                {
                    $event.currentTarget.classList.add("textZoneOpen");
                    if(scope.previousOpen != null)
                        scope.previousOpen.classList.remove("textZoneOpen");
                    scope.previousOpen = $event.currentTarget == scope.previousOpen ? null : $event.currentTarget;
                }

                let _selectedanswer;
                scope.isFilled = false;

                scope.showAnswers = function(ele, text_zone) {
                    if (text_zone.answer !== '') {
                        scope.isFilled = true;
                    } else {
                        scope.isFilled = false;
                    }
                    scope.showAnswersMobile = true;
                    $('.item-selected').removeClass('item-selected');
                    $(ele.target).addClass('item-selected');
                    _selectedanswer = text_zone;
                }

                scope.selectAnswer = function(option) {
                    scope.removeAnswer(_selectedanswer);
                    scope.showAnswersMobile = false;
                    _selectedanswer.answer = option.option;
                    option.zoneId = _selectedanswer.id;
                    scope.usedAnswers.push(option);
                    $('.item-selected').removeClass('item-selected');
                    scope.updateGrainCopy();
                }
            }
        };
    }]
);







