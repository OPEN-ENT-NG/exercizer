directives.push({
        name: 'fillZone',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    zoneId: '@'
                },
                template: '<text-zone ng-class="{ success: correction && isCorrect, error: correction && !isCorrect }">' +
                '<div ng-class="{ success: correction[$index], error: !correction[$index] }" ng-if="mode === \'view\'">[[zone.answer]]</div>' +
                '<input type="text" disabled placeholder= "[[zone.answer]]" ng-if="mode === \'edit\'" />' +
                '<input type="text" ng-if="mode === \'perform-text\'" ng-model="zone.answer" />' +
                '<select ng-if="mode === \'perform-list\'" ng-options="o as o for o in zone.options" ng-model="zone.answer"></select>' +
                '<div drag-item="zone" drop-item="answer($item)" ng-if="mode === \'perform-drag\'">[[zone.answer]]</div>' +
                '</text-zone>',
                link: function (scope, element, attributes) {
                    setTimeout(() => {
                        scope.mode = 'view';
                        if (element.parents('edit-fill-text').length > 0) {
                            scope.mode = 'edit';
                        }
                        if (element.parents('perform-fill-text').length > 0) {
                            scope.mode = 'perform-' + scope.$parent.$eval('customData.answersType');
                        }
                        scope.$apply();
                    }, 50);
                    
                    element.on('click', (e) => {
                        scope.$parent.$eval('editZone(' + scope.zoneId + ')');
                        e.preventDefault();
                        scope.$parent.$apply();
                    });
                    scope.zoneId = parseInt(scope.zoneId);
                    scope.zone = _.findWhere(scope.$parent.$eval('customData.zones'), { id: scope.zoneId });
                    scope.correction = scope.$parent.$eval('correction');
                    if (scope.correction) {
                        let index = scope.$parent.$eval('customData.zones').indexOf(scope.zone);
                        scope.isCorrect = scope.correction[index];
                    }

                    scope.answer = ($item) => {
                        scope.$parent.removeAnswer(scope.zone);
                        scope.zone.answer = $item;
                        scope.$parent.usedAnswers.push($item);
                    };
                }
            }
        }]
    }
);