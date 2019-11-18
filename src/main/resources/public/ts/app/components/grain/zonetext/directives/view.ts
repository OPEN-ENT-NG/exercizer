import { ng, $ } from 'entcore';
import { automaticCorrection } from '../../common/zonegrain/model';
import { CustomData, TextZone } from '../models/CustomData';

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







