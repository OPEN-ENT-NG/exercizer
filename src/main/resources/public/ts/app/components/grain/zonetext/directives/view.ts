import { ng, $ } from 'entcore';
import { automaticCorrection } from '../../common/zonegrain/model';
import { CustomData, TextZone } from '../models/CustomData';
import { transformX, transformY, transformW } from './zoneCommon';

export const viewZoneText = ng.directive('viewZoneText',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainScheduled: '=',
                grainCopy: '=',
                isTeacher: '=',
                grainCopyList: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/zonetext/templates/view.html',
            link: (scope: any) => {
                scope.grainCopy.grain_copy_data.custom_copy_data = new CustomData(scope.grainCopy.grain_copy_data.custom_copy_data);

                scope.displayCorrection = false;
                scope.doDisplayCorrection = function() {
                    scope.displayCorrection = !scope.displayCorrection;
                }
                scope.displayCorrectAnswerButton = function() {
                    return !scope.isTeacher && !angular.isUndefined(scope.grainCopy.final_score)
                    && !angular.isUndefined(scope.displayCorrection) && ((scope.grainCopy.final_score == null) || 
                    (scope.grainCopy.final_score < scope.grainCopy.grain_copy_data.max_score));
                };

                var result = automaticCorrection(scope.grainScheduled, scope.grainCopy);
                scope.correction = result.answers_result.correction;
                if (!scope.grainCopy.calculated_score) {
                    scope.grainCopy.calculated_score = result.calculated_score;
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                }

                scope.updateGrainCopy = function () {
                    if (scope.isTeacher) {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }
                };

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







