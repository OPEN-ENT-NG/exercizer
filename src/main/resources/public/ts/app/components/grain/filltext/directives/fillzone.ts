import { ng } from 'entcore';
import { _ } from 'entcore';

export const fillZone = ng.directive('fillZone',
    [() => {
        return {
            restrict: 'E',
            scope: {
                zoneId: '@'
            },
            template: '<text-zone ng-class="{ success: optionData.correction && optionData.isCorrect, error: optionData.correction && !optionData.isCorrect }">' +
            '<i class="close" ng-click="removeFillZone($event)" ng-if="optionData.mode === \'edit\'"></i>' +
            '<i class="edit" ng-if="optionData.mode === \'edit\'"></i>' +
            '<div ng-if="optionData.mode === \'view\'"><span>[[optionData.zone.answer]]</span></div>' +
            '<input type="text" disabled placeholder="[[optionData.zone.answer]]" ng-if="optionData.mode === \'edit\'" />' +
            '<input type="text" ng-if="optionData.mode === \'perform-text\'" ng-model="optionData.zone.answer" />' +
            '<select ng-if="optionData.mode === \'perform-list\'" ng-options="o as o for o in optionData.zone.options" ng-model="optionData.zone.answer"></select>' +
            '<div drag-item="optionData.zone" drop-item="answer($item)" ng-if="optionData.mode === \'perform-drag\'"><span>[[optionData.zone.answer]]</span></div>' +
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

                scope.answer = ($item) => {
                    scope.$parent.removeAnswer(scope.optionData.zone);
                    scope.optionData.zone.answer = $item;
                    scope.$parent.usedAnswers.push($item);
                    scope.$parent.updateGrainCopy();
                };
            }
        }
    }]
);