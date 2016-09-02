directives.push({
        name: 'fillZone',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    zoneId: '@'
                },
                template: '<text-zone ng-class="{ success: optionData.correction && optionData.isCorrect, error: optionData.correction && !optionData.isCorrect }">' +
                '<div ng-class="{ success: optionData.correction[$index], error: !optionData.correction[$index] }" ng-if="optionData.mode === \'view\'"><span>[[optionData.zone.answer]]</span></div>' +
                '<input type="text" disabled placeholder="[[optionData.zone.answer]]" ng-if="optionData.mode === \'edit\'" />' +
                '<input type="text" ng-if="optionData.mode === \'perform-text\'" ng-model="optionData.zone.answer" />' +
                '<select ng-if="optionData.mode === \'perform-list\'" ng-options="o as o for o in optionData.zone.options" ng-model="optionData.zone.answer"></select>' +
                '<div drag-item="optionData.zone" drop-item="answer($item)" ng-if="optionData.mode === \'perform-drag\'"><span>[[optionData.zone.answer]]</span></div>' +
                '</text-zone>',
                link: function (scope, element, attributes) {
                    scope.optionData = {
                        zoneId: parseInt(scope.zoneId),
                        zone: _.findWhere(scope.$parent.$eval('customData.zones'), { id: parseInt(scope.zoneId) }),
                        correction: scope.$parent.$eval('correction')
                    }
                    setTimeout(() => {
                        scope.optionData.mode = 'view';
                        if (element.parents('edit-fill-text').length > 0) {
                            scope.optionData.mode = 'edit';
                        }
                        if (element.parents('perform-fill-text').length > 0) {
                            scope.optionData.mode = 'perform-' + scope.$parent.$eval('customData.answersType');
                        }
                        scope.$apply();
                    }, 50);
                    
                    element.on('click', (e) => {
                        scope.$parent.$eval('editZone(' + scope.optionData.zoneId + ')');
                        e.preventDefault();
                        scope.$apply();
                    });
                    if (scope.correction) {
                        let index = scope.$parent.$eval('customData.zones').indexOf(scope.zone);
                        scope.optionData.isCorrect = scope.correction[index];
                    }

                    scope.answer = ($item) => {
                        scope.$parent.removeAnswer(scope.zone);
                        scope.optionData.zone.answer = $item;
                        scope.$parent.usedAnswers.push($item);
                    };
                }
            }
        }]
    }
);