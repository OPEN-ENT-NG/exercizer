import { ng } from 'entcore';
import { angular } from 'entcore';

export const viewAssociation  = ng.directive('viewAssociation',
    ['AssociationService', (AssociationService) => {
        return {
            restrict: 'E',
            scope: {
                grainScheduled: '=',
                grainCopy: '=',
                grainCopyList: '=',
                isTeacher: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/association/templates/view-association.html',
            link: (scope:any) => {

                var result = AssociationService.automaticCorrection(scope.grainScheduled, scope.grainCopy);
                scope.isCorrect = result.answers_result;
                if (angular.isUndefined(scope.grainCopy.calculated_score) || scope.grainCopy.calculated_score === null) {
                    scope.grainCopy.calculated_score = result.calculated_score;
                    scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                }

                scope.updateGrainCopy = function () {
                    if (scope.isTeacher) {
                        scope.$emit('E_UPDATE_GRAIN_COPY', scope.grainCopy);
                    }
                };
            }
        };
    }]
);







