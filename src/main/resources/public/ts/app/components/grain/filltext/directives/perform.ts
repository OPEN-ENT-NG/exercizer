import { ng } from 'entcore';
import { _ } from 'entcore';
import { CustomData, TextZone } from '../models/CustomData';

export const performFillText = ng.directive('performFillText',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainCopy: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/filltext/templates/perform.html',
            link: (scope: any) => {
                scope.$watch(function () {
                    if (scope.customData && scope.customData.answersType === 'drag') {
                        //adapt the width of the textzone
                        $("fill-zone > text-zone").each(function() {$(this).width(getTextWidth(($(this)[0] as any).innerText, $(this).css('font')));});
                    }
                    return scope.grainCopy;
                }, function () {
                    scope.grainCopy.grain_copy_data.custom_copy_data = new CustomData(scope.grainCopy.grain_copy_data.custom_copy_data);
                    scope.customData = scope.grainCopy.grain_copy_data.custom_copy_data;
                    //shuffle
                    if (scope.customData.answersType === 'list') {
                        _.forEach(scope.customData.zones, function (zone) {
                            zone.options = zone.options.filter(option => option != null);
                            var tmp = _.clone(zone.options);
                            var secureLoop = 0;

                            if (tmp && tmp.length > 1) {
                                while (zone.options[0] === tmp[0]) {
                                    zone.options = _.shuffle(zone.options);
                                    if (secureLoop === 5) return false;
                                    secureLoop++;
                                }
                            }
                        });
                    } else if (scope.customData.answersType === 'drag') {
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
                });

                scope.updateGrainCopy = () => {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };

                scope.removeAnswer = ($item: TextZone) => {
                    if (!$item.answer) {
                        return;
                    }

                    var i;

                    _.forEach(scope.usedAnswers, function (opt, $index) {
                        if (opt.zoneId === $item.id) {
                           i = $index;
                        }
                    });
                    
                    scope.usedAnswers.splice(i, 1);
                    $item.answer = '';
                };

                scope.availableOption = (option) => {
                    var found = false;
                    _.forEach(scope.usedAnswers, function (opt) {
                        if (opt.id === option.id) {
                            found = true;
                        }
                    });

                    return !found;
                }

                let _selectedanswer;

                scope.showAnswers = function(ele, text_zone) {
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

                function getTextWidth(text, font) {
                    var canvas:any = document.createElement("canvas");
                    var context:any = canvas.getContext("2d");
                    context.font = font;
                    var metrics = context.measureText(text);
                    return metrics.width;
                }

                $('body').on('click', event => {
                    scope.showAnswersMobile = true;
                    $('.item-selected').removeClass('item-selected');
                });
            }
        };
    }]
);







