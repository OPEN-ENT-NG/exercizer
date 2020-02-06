import { ng } from 'entcore';
import { IGrainCopy } from '../../../../models/domain';
import { $ } from 'entcore';

export const subjectPerformCopyBottomNav = ng.directive('subjectPerformCopyBottomNav',
    ['$location', 'DateService', ($location, DateService) => {
        return {
            restrict: 'E',
            scope: {
                'subjectScheduled': '=',
                'subjectCopy': '=',
                'grainCopyList': '=',
                'isCanSubmit': '='
            },
            templateUrl: 'exercizer/public/ts/app/components/subject/subject_perform_copy/templates/subject-perform-copy-bottom-nav.html',
            link:(scope:any) => {
                scope.currentGrainCopy = undefined;
                scope.currentGrainCopyIndex = undefined;
                
                scope.grainCopyList = scope.grainCopyList.sort((a:IGrainCopy, b:IGrainCopy) => {
                    if (a.display_order && b.display_order) {
                        return a.display_order - b.display_order;
                    }
                    return a.order_by - b.order_by;
                });

                scope.hasPrevious = function() {
                    return !angular.isUndefined(scope.currentGrainCopy);
                };
                
                scope.hasNext = function() {
                    return (angular.isUndefined(scope.currentGrainCopy) && (!angular.isUndefined(scope.grainCopyList) && scope.grainCopyList.length > 0))
                        || scope.currentGrainCopyIndex < scope.grainCopyList.length - 1;
                };
                
                scope.navigateToPrevious = function() {
                    (window as any).scrollTo(0,0);
                    if (scope.hasPrevious()) {
                        _navigateTo(scope.grainCopyList[scope.currentGrainCopyIndex - 1]);
                    }
                };
                
                scope.navigateToNext = function() {
                    (window as any).scrollTo(0,0);
                    if (scope.hasNext()) {
                        _navigateTo(scope.grainCopyList[angular.isUndefined(scope.currentGrainCopy) ? 0 : scope.currentGrainCopyIndex + 1]);
                    }
                };
                
                function _navigateTo(grainCopy:IGrainCopy = undefined) {
                    $('.grain-perform').css({ opacity: 0, transition: 'all 250ms ease' });
                    setTimeout(() => {
                        $('.grain-perform').removeAttr("style");
                        scope.$emit('E_CURRENT_GRAIN_COPY_CHANGED', grainCopy, scope.grainCopyList);
                        scope.$apply();
                    }, 300);
                }

                scope.$on('E_CURRENT_GRAIN_COPY_CHANGE' , function(event, grainCopy:IGrainCopy) {
                    scope.currentGrainCopy = grainCopy;
                    scope.currentGrainCopyIndex = angular.isUndefined(grainCopy) ? undefined : scope.grainCopyList.indexOf(grainCopy);
                });

                scope.isModalDisplayed = false;

                scope.redirectToDashboard = function(submit:boolean) {
                    if (scope.subjectCopy.is_training_copy) {
                        scope.saveCurrentGrain();
                    }
                    if (submit) {
                        scope.isModalDisplayed = true;
                    } else {
                        $location.path('/dashboard');
                    }
                };   

                scope.saveCurrentGrain = function() {
                    scope.subjectCopy.current_grain_id = scope.currentGrainCopy ? scope.currentGrainCopy.id : -1;
                    scope.$emit('E_SUBJECT_COPY_LATER', scope.subjectCopy.id, scope.subjectCopy.current_grain_id);
                }

                scope.canSubmit = function(){
                    //it's possible to submit if the begin date is passed even if due date is exceeded (Unless it has already submit)
                    return !scope.hasNext() && scope.isCanSubmit && DateService.compare_after(new Date(), DateService.isoToDate(scope.subjectScheduled.begin_date), true) &&
                        (scope.subjectCopy.submitted_date === null || canReplace());
                };

                function canReplace() {
                    return scope.subjectCopy.submitted_date != null && !scope.subjectScheduled.is_one_shot_submit &&
                        DateService.compare_after(DateService.isoToDate(scope.subjectScheduled.due_date), new Date(), true);
                };

                scope.closeModal = function() {
                    scope.isModalDisplayed = false;
                };

                scope.submitSubjectCopy = function() {
                    scope.$emit('E_SUBJECT_COPY_SUBMITTED', scope.subjectCopy);
                };
            }
        };
    }]
);

