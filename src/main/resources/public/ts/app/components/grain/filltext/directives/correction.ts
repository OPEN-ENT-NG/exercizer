import { ng } from 'entcore';
import { automaticCorrection } from '../../common/zonegrain/model';

export const correctionFillText = ng.directive('correctionFillText',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainScheduled: '=',
                grainCopy: '=',
                isTeacher: '='
            },
            template: `
                <div class="row">
                    <div bind-html="grainScheduled.grain_data.custom_data.htmlContent"></div>
                </div>
            `,
            link: (scope: any) => {

                scope.displayCorrection = false;
                scope.doDisplayCorrection = function() {
                    scope.displayCorrection = !scope.displayCorrection;
                }

                var result = automaticCorrection(scope.grainScheduled, scope.grainCopy);
                scope.correction = [];//result.answers_result.correction;
                scope.customData = scope.grainScheduled.grain_data.custom_data;
                scope.customData.zones.forEach((textZone, i) => {
                    scope.correction.push(true);
                });


                scope.updateGrainCopy = function () {
                    if (scope.isTeacher) {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }
                };
            }
        };
    }]
);







