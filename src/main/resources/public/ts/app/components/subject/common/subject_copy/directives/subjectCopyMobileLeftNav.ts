import { ng } from 'entcore';
import { IGrainCopy } from '../../../../../models/domain';
import { CorrectOrderHelper } from '../../../../../models/helpers';
import { $ } from 'entcore';

export const subjectCopyMobileLeftNav = ng.directive('subjectCopyMobileLeftNav',
    ['GrainTypeService', '$route', (GrainTypeService, $route) => {
        return {
            restrict: 'E',
            scope: {
                'currentGrainCopy': '=',
                'grainCopyList': '=',
                'grainCopyChange': '&'
            },
            templateUrl: 'exercizer/public/ts/app/components/subject/common/subject_copy/templates/subject-copy-mobile-left-nav.html',
            link:(scope:any) => {

                let mobileNavMode;

                let init = function(action: string) {
                    scope.currentGrainCopy = undefined;
                    switch(action) {
                        case "performSubjectCopy":
                        case "previewPerformSubjectCopy": {
                            scope.showMobileNav = true;
                            mobileNavMode = "perform";
                            break;
                        }
                        case "viewSubjectCopy":
                        case "previewViewSubjectCopy": {
                            scope.showMobileNav = true;
                            mobileNavMode = "view";
                            break;
                        }
                        default:
                            scope.showMobileNav = false;
                    }
                }

                init($route.current.$$route.action);

                scope.$on('$routeChangeStart', function($event, next, current) {
                    init(next.$$route.action);
                });

                scope.getGrainCopyName = function (grainCopy:IGrainCopy) {
                    if (grainCopy.grain_copy_data && grainCopy.grain_copy_data.title) {
                        return grainCopy.grain_copy_data.title;
                    } else {
                        var grainType = GrainTypeService.getById(grainCopy.grain_type_id);
                        return grainType.public_name;
                    }
                };

                scope.navigateTo = function(grainCopy:IGrainCopy = undefined) {
                    if (mobileNavMode == "view") {
                        var article = $("article#" + ((grainCopy) ? grainCopy.id : 'summary'));
                        if(article.length) {
                            $('html, body').animate({ scrollTop: article.offset().top - 70 }, 500);
                        }
                    } else if (mobileNavMode == "perform") {
                        scope.currentGrainCopy = grainCopy;
                    }
                    $('.side-nav').removeClass('slide');
                    $('body').removeClass('point-out');
                    scope.grainCopyChange({grainCopy : grainCopy});
                };

                scope.getCorrectOrder = function(grainCopy:IGrainCopy) {
                    return CorrectOrderHelper.getCorrectOrder(grainCopy, scope.grainCopyList);
                };

                scope.isSummarySelected = function(currentGrainCopy: IGrainCopy, grainCopy: IGrainCopy) {
                    return (mobileNavMode == "perform") && (!scope.currentGrainCopy);
                }
            }
        };
    }]
);

