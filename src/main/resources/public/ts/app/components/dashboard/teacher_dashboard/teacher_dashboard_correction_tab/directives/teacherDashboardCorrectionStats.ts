import { ng, notify, _ } from 'entcore';
import {IGrainCopy} from "../../../../../models/domain/GrainCopy";

export const teacherDashboardCorrectionStats = ng.directive('teacherDashboardCorrectionStats', ['GrainCopyService', 'GrainScheduledService', 'CorrectionService', 'SubjectCopyService', (GrainCopyService, GrainScheduledService, CorrectionService, SubjectCopyService) => {
        return {
            restrict: 'E',
            scope: {
                selectedSubjectScheduled: "=",

            },
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/templates/teacher-dashboard-correction-stats.html',
            link: (scope:any) => {
                scope.$watch('selectedSubjectScheduled.showStats', function(newValue, oldValue) {
                    if(scope.selectedSubjectScheduled && scope.selectedSubjectScheduled.showStats){
                        scope.score = {sum:0, nb:0};
                        scope.numberCopySubmitted = 0;
                        scope.numberCopyNotCorrected = 0;
                        scope.subjectCopyList = SubjectCopyService.getListBySubjectScheduled(scope.selectedSubjectScheduled);
                        scope.subjectCopyList.forEach(copy => {
                            if(copy.is_corrected){
                                scope.score.sum += copy.final_score;
                                scope.score.nb++;
                            }else {
                                scope.numberCopyNotCorrected++;
                            }
                            if(copy.submitted_date){
                                scope.numberCopySubmitted++;
                            }
                        });
                    }
                });

                scope.seeAllAssignAtList = function(){
                    scope.assignDisplayed=true;
                };
            }
        };
    }]
);
