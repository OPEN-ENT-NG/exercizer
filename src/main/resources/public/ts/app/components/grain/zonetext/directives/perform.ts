import { ng, $ } from 'entcore';
import { CustomData, TextZone } from '../models/CustomData';
import { transformX, transformY, transformW } from './zoneCommon';

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

                scope.getResizedTextZoneX = function(x: number, reverseTransform: boolean): number
                {
                    return transformX("#bckgrnd", x, reverseTransform);
                };

                scope.getResizedTextZoneY = function(y: number, reverseTransform: boolean): number
                {
                    return transformY("#bckgrnd", y, reverseTransform);
                };

                scope.getResizedTextZoneW = function(w: number, reverseTransform: boolean): number
                {
                    let trans = transformW("#bckgrnd", w, reverseTransform);
                    $(".base-image > article > text-zone").css({
                        width: trans
                    });
                    return trans;
                };
            }
        };
    }]
);







