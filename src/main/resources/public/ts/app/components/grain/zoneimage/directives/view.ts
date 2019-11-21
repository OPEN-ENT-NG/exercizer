import { ng, $ } from 'entcore';
import { CustomData, IconZone } from '../models/CustomData';
import { automaticCorrection } from '../../common/zonegrain/model';

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
                    return scope.displayCorrection;
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

                $( "#bckgrnd" ).load(function() {
                    scope.$apply();
                });

                scope.getResizedIconZone = function(iconZone: IconZone) {
                    let img = $("#bckgrnd");
                    let marginLeft = (img.outerWidth(true) - img.outerWidth()) / 2;
                    return {
                        x: iconZone.position.x * (img.width() / 760) + marginLeft,
                        y: iconZone.position.y * (img.height() / 600),
                        z: iconZone.position.z
                    }
                }
            }
        };
    }]
);







