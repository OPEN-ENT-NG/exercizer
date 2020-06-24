import { ng } from 'entcore';
import { _ } from 'entcore';
import { $ } from 'entcore';

export const fillZone = ng.directive('fillZone',
    [() => {
        return {
            restrict: 'E',
            scope: {
                zoneId: '@'
            },
            template: '<text-zone style="max-width:unset" ng-class="{ success: optionData.correction && optionData.isCorrect, error: optionData.correction && !optionData.isCorrect }" ng-style="{ width: optionData.correction ? \'auto\' : \'\' }">' +
            '<i class="close" ng-click="removeFillZone($event)" ng-if="optionData.mode === \'edit\'"></i>' +
            '<i class="edit" ng-if="optionData.mode === \'edit\'"></i>' +
            '<div ng-if="optionData.mode === \'view\'"><div>[[optionData.zone.answer]]</div></div>' +
            '<input type="text" disabled placeholder="[[optionData.zone.answer]]" ng-if="optionData.mode === \'edit\'" />' +
            '<input type="text" maxlength="40" ng-if="optionData.mode === \'perform-text\'" ng-model="optionData.zone.answer" />' +
            '<select ng-if="optionData.mode === \'perform-list\'" ng-options="o as o for o in optionData.zone.options" ng-model="optionData.zone.answer"></select>' +
            '<div class="zero-mobile-fat-mobile" drag-item="optionData.zone" drop-item="answer($item)" ng-if="optionData.mode === \'perform-drag\'"><div>[[optionData.zone.answer]]</div></div>' +
            '<div class="mobile-fat-mobile" drag-item="optionData.zone" drop-item="answer($item)" ng-click="showAnswers($event)" ng-if="optionData.mode === \'perform-drag\'"><div>[[optionData.zone.answer]]</div></div>' +
            '</text-zone>',
            link: function (scope, element, attributes) {
                scope.removeFillZone = ($event) => {
                    $event.stopPropagation();
                    scope.$parent.$eval('customData.zones').forEach((zone) => {
                        if(zone.id === parseInt(scope.zoneId)){
                            scope.$parent.customData.removeZone(zone);
                        }
                    });

                    element.remove();
                };

                scope.optionData = {
                    zoneId: parseInt(scope.zoneId),
                    zone: _.findWhere(scope.$parent.customData.zones, { id: parseInt(scope.zoneId) }),
                    correction: scope.$parent.correction
                }

                if (scope.optionData.correction) {
                    let index = scope.$parent.customData.zones.indexOf(scope.optionData.zone);
                    scope.optionData.isCorrect = scope.optionData.correction[index];
                }

                if (scope.$parent.isViewingCorrection) {
                    scope.optionData.isCorrect = true;
                }

                setTimeout(() => {
                    scope.optionData.mode = 'view';
                    if (element.parents('edit-fill-text').length > 0) {
                        scope.optionData.mode = 'edit';
                    }
                    if (element.parents('perform-fill-text').length > 0) {
                        scope.optionData.mode = 'perform-' + scope.$parent.customData.answersType;
                    }
                    scope.$apply();
                }, 50);
                
                var openEdit = (e) => {
                    scope.$parent.editZone(scope.optionData.zoneId);
                    e.preventDefault();
                    scope.$apply();
                };

                element.on('click', '.edit', openEdit);
                element.on('click', openEdit);
                
                element.on('change', 'input, select', () => {
                    scope.$parent.updateGrainCopy();
                });

                scope.showAnswers = ($event) => {
                    scope.$parent.showAnswers($event, scope.optionData.zone);
                }

                scope.answer = ($item) => {
                    scope.$parent.removeAnswer(scope.optionData.zone);
                    scope.optionData.zone.answer = $item.option;
                    $("fill-zone[zone-id='" + scope.optionData.zone.id  + "'] > text-zone").width(getTextWidth($item.option, '16px Roboto'));
                    $item.zoneId = scope.optionData.zone.id;
                    if ($item.option) {
                        scope.$parent.usedAnswers.push($item);
                    }
                    scope.$parent.updateGrainCopy();
                };

                function getTextWidth(text, font) {
                    var canvas:any = document.createElement("canvas");
                    var context:any = canvas.getContext("2d");
                    context.font = font;
                    var metrics = context.measureText(text);
                    return metrics.width;
                }
            }
        }
    }]
);