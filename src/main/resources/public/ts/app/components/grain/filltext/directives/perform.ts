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
                    return scope.grainCopy;
                }, function () {
                    scope.grainCopy.grain_copy_data.custom_copy_data = new CustomData(scope.grainCopy.grain_copy_data.custom_copy_data);
                    scope.customData = scope.grainCopy.grain_copy_data.custom_copy_data;
                    //shuffle
                    if (scope.customData.answersType === 'list') {
                        _.forEach(scope.customData.zones, function (zone) {
                            zone.options = _.shuffle(zone.options);
                        });
                    } else if (scope.customData.answersType === 'drag') {
                        scope.customData.options = _.shuffle(scope.customData.options);
                    }
                });
                
                scope.usedAnswers = [];

                scope.updateGrainCopy = () => {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };

                scope.answer = (textZone, $item: string) => {
                    scope.removeAnswer(textZone);
                    textZone.answer = $item;
                    scope.usedAnswers.push($item);
                };

                scope.removeAnswer = ($item: TextZone) => {
                    if (!$item.answer) {
                        return;
                    }
                    var i = scope.usedAnswers.indexOf($item.answer);
                    scope.usedAnswers.splice(i, 1);
                    $item.answer = '';
                };

                scope.availableOption = (option) => scope.usedAnswers.indexOf(option) === -1;
            }
        };
    }]
);







