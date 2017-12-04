import { ng } from 'entcore';
import { IGrainCopy } from '../../../../../models/domain';
import { CorrectOrderHelper } from '../../../../../models/helpers';
import { $ } from 'entcore';

export const subjectCopyLeftNav = ng.directive('subjectCopyLeftNav',
    ['GrainTypeService', (GrainTypeService) => {
        return {
            restrict: 'E',
            scope: {
                'grainCopyList': '=',
                'anchorBehaviour': '='
            },
            templateUrl: 'exercizer/public/ts/app/components/subject/common/subject_copy/templates/subject-copy-left-nav.html',
            link:(scope:any) => {
                scope.currentGrainCopy = undefined;

                scope.getGrainCopyName = function (grainCopy:IGrainCopy) {
                    if (grainCopy.grain_copy_data && grainCopy.grain_copy_data.title) {
                        return grainCopy.grain_copy_data.title;
                    } else {
                        var grainType = GrainTypeService.getById(grainCopy.grain_type_id);
                        return grainType.public_name;
                    }
                };

                scope.navigateTo = function(grainCopy:IGrainCopy = undefined) {
                    var article = $("article#" + ((grainCopy) ? grainCopy.id : 'summary'));
                    if(article.length)
                        $('html, body').animate({ scrollTop: article.offset().top - 70 }, 500);

                    scope.$emit('E_CURRENT_GRAIN_COPY_CHANGED', grainCopy, scope.grainCopyList);
                };

                scope.getCorrectOrder = function(grainCopy:IGrainCopy) {
                    return CorrectOrderHelper.getCorrectOrder(grainCopy, scope.grainCopyList);
                };

                scope.$on('E_CURRENT_GRAIN_COPY_CHANGE' , function(event, grainCopy:IGrainCopy) {
                    scope.currentGrainCopy = grainCopy;

                    if (scope.anchorBehaviour) {
                        //$('html, body').animate({ scrollTop: $(angular.isUndefined(grainCopy) ? '#summary' : '#' + grainCopy.id).offset().top - 100}, 500);
                    }
                });
            }
        };
    }]
);

