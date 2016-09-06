directives.push({
        name: 'fillZone',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    zoneId: '@'
                },
                template: '<text-zone ng-class="{ success: optionData.correction && optionData.isCorrect, error: optionData.correction && !optionData.isCorrect }">' +
                '<div ng-if="optionData.mode === \'view\'"><span>[[optionData.zone.answer]]</span></div>' +
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

                    if (scope.optionData.correction) {
                        let index = scope.$parent.$eval('customData.zones').indexOf(scope.optionData.zone);
                        scope.optionData.isCorrect = scope.optionData.correction[index];
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
                    
                    element.on('change', 'input, select', () => {
                        scope.$parent.$eval('updateGrainCopy()');
                    });

                    scope.answer = ($item) => {
                        scope.$parent.removeAnswer(scope.optionData.zone);
                        scope.optionData.zone.answer = $item;
                        scope.$parent.usedAnswers.push($item);
                        scope.$parent.$eval('updateGrainCopy()');
                    };
                }
            }
        }]
    }
);