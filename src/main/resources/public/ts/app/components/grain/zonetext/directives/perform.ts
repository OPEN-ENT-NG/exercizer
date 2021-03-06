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

                scope.apply = () => {
                    //workaround for AngularJs bug https://github.com/angular/angular.js/issues/7692
                    scope.$apply();
                    scope.updateGrainCopy();
                };

                let selector = `#${scope.grainCopy.id}-bckgrnd`;
                $(selector).load(function() {
                    scope.apply();
                });

                scope.getResizedTextZoneX = function(x: number, reverseTransform: boolean): number
                {
                    let selector = `#${scope.grainCopy.id}-bckgrnd`;
                    return transformX(selector, x, reverseTransform);
                };

                scope.getResizedTextZoneY = function(y: number, reverseTransform: boolean): number
                {
                    let selector = `#${scope.grainCopy.id}-bckgrnd`;
                    return transformY(selector, y, reverseTransform);
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
                    console.log($event.currentTarget);
                    $event.currentTarget.classList.add("textZoneOpen");
                    if(scope.previousOpen != null)
                        scope.previousOpen.classList.remove("textZoneOpen");
                    scope.previousOpen = $event.currentTarget == scope.previousOpen ? null : $event.currentTarget;
                }
            }
        };
    }]
);







