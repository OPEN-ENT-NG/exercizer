import { ng, $ } from 'entcore';
import { CustomData, IconZone } from '../models/CustomData';
import { automaticCorrection } from '../../common/zonegrain/model';
import { transformX, transformY } from '../../zonetext/directives/zoneCommon';

export const viewZoneImage = ng.directive('viewZoneImage',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainScheduled: '=',
                grainCopy: '=',
                grainCopyList: '=',
                isTeacher: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/zoneimage/templates/view.html',
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

                $( "#bckgrnd" ).load(function() {
                    scope.$apply();
                });

                scope.getResizedIconZoneX = function(x: number, reverseTransform: boolean): number
                {
                    return transformX("#bckgrnd", x, reverseTransform);
                };

                scope.getResizedIconZoneY = function(y: number, reverseTransform: boolean): number
                {
                    return transformY("#bckgrnd", y, reverseTransform);
                };
            }
        };
    }]
);







