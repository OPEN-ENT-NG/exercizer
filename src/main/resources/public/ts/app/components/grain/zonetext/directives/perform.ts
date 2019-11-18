import { ng, $ } from 'entcore';
import { CustomData, TextZone } from '../models/CustomData';

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
                scope.$watch("grainCopy",function(newValue,oldValue) {
                    scope.init();
                });

                scope.init = () => {
                    scope.grainCopy.grain_copy_data.custom_copy_data = new CustomData(scope.grainCopy.grain_copy_data.custom_copy_data);
                };

                scope.usedAnswers = [];

                scope.updateGrainCopy = () => {
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                };

                scope.answer = (textZone, $item: string) => {
                    scope.removeAnswer(textZone);
                    textZone.answer = $item;
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

                scope.apply = () => {
                    //workaround for AngularJs bug https://github.com/angular/angular.js/issues/7692
                    scope.$apply();
                    scope.updateGrainCopy();
                };

                $( "#bckgrnd" ).load(function() {
                    scope.apply();
                });

                scope.getResizedTextZone = function(textZone: TextZone) {
                    let img = $("#bckgrnd");
                    let marginLeft = (img.outerWidth(true) - img.outerWidth()) / 2;
                    $("text-zone").css({
                        width: 150 * (img.width() / 760)
                    });
                    return {
                        x: textZone.position.x * (img.width() / 760) + marginLeft,
                        y: textZone.position.y * (img.height() / 600),
                        z: textZone.position.z,
                        w: 150 * (img.width() / 760)
                    }
                }
            }
        };
    }]
);







