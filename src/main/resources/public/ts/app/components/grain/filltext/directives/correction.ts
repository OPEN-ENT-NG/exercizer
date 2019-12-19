import { ng } from 'entcore';

export const correctionFillText = ng.directive('correctionFillText',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainScheduled: '=',
            },
            template: `
                <div class="row">
                    <div bind-html="grainScheduled.grain_data.custom_data.htmlContent"></div>
                </div>
            `,
            link: (scope: any) => {

                scope.isViewingCorrection = true;

                scope.correction = [];
                scope.customData = scope.grainScheduled.grain_data.custom_data;
                scope.customData.zones.forEach( _ => {
                    scope.correction.push(true);
                });

                scope.updateGrainCopy = scope.$parent.updateGrainCopy;
            }
        };
    }]
);







