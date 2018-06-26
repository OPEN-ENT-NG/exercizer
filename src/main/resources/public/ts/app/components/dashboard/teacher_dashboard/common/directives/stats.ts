import { ng, notify, idiom, _ } from 'entcore';
import {IGrainCopy} from "../../../../../models/domain/GrainCopy";

export const stats = ng.directive('stats', ['GrainCopyService', 'GrainScheduledService', 'CorrectionService', (GrainCopyService, GrainScheduledService, CorrectionService) => {
    return {
        restrict: 'E',
        scope: {
            subjectCopyList: "=",
            subjectScheduled: "=",
            filterOwner: "="
            
        },
        templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/common/templates/stats.html',
        link: (scope:any) => {
            scope.$watch('subjectCopyList', function(newValue, oldValue) {
                if(scope.subjectCopyList){
                    GrainScheduledService.getListBySubjectScheduled(scope.subjectScheduled).then(scheduledGrains => {
                        scope.scheduledGrains= scheduledGrains;
                        scope.filtredScheduledGrains =scope.scheduledGrains.filter(grain => grain.grain_type_id > 3)
                    });
                    scope.matrice = {};
                    scope.index = 0;
                    scope.scores = {auto:{sum:0, nb:0}, final:{sum:0, nb:0}};
                    scope.submittedCopies = scope.subjectCopyList.filter( copy => copy.submitted_date != null);
                    if(scope.submittedCopies && scope.submittedCopies.length > 0)
                    GrainCopyService.getListBySubjectCopies(scope.submittedCopies).then(listMapped => {
                        scope.listMapped = listMapped;
                        scope.submittedCopies.forEach(copy => {
                            if(copy.calculated_score != null) {
                                scope.scores.auto.sum += copy.calculated_score;
                                scope.scores.auto.nb++;
                            }
                            if(copy.final_score != null) {
                                scope.scores.final.sum += copy.final_score;
                                scope.scores.auto.nb++;
                            }


                            scope.matrice[copy.id] = {};
                            if(!copy.is_correction_on_going)
                                CorrectionService.grainsCorrection(scope.listMapped[copy.id], scope.scheduledGrains);
                            scope.listMapped[copy.id].forEach(grain => {
                                if(grain.final_score != null && grain.final_score != grain.calculated_score){
                                    grain.score = grain.final_score;
                                    grain.changed = true;
                                }else{
                                    grain.score = grain.calculated_score;
                                }
                                if(grain.score != null) {
                                    if(!scope.scores[grain.grain_scheduled_id])
                                        scope.scores[grain.grain_scheduled_id] = {sum:0, nb:0};
                                    scope.scores[grain.grain_scheduled_id].sum += grain.score;
                                    scope.scores[grain.grain_scheduled_id].nb++;
                                }
                                scope.matrice[copy.id][grain.grain_scheduled_id] = grain;
                            })
                        })
                    });
                    console.log(scope.matrice);
                }
            });

            scope.translate = idiom.translate;

            scope.getScore = function (grainId) {
                if(scope.scores[grainId] && scope.scores[grainId].nb > 0)
                    return scope.scores[grainId].sum/scope.scores[grainId].nb;
            }

            scope.hoverIndex = function(indx){
                scope.hoverIndex = indx;
            }

            var n = 0;
            $('#infos').on('scroll', function () {
                if(n == 0) {
                    $('#scores').scrollTop($(this).scrollTop());
                    n++;
                }else
                    n--;
            });


            scope.test = function () {
                console.log("test")
            }

            $('#scores').on('scroll', function () {
                if(n == 0) {
                    $('#infos').scrollTop($(this).scrollTop());
                    n++;
                }else
                    n--;
            });

            scope.upIndex = function(){
                if(scope.index < scope.filtredScheduledGrains.length-6)
                    scope.index++;
            }

            scope.downIndex = function(){
                if(scope.index > 0)
                    scope.index--;
            }



            scope.confirmExclude = function() {
                var copyIds = [];
                angular.forEach(scope.subjectCopyList, function(copy){
                    if (copy.selected) copyIds.push(copy.id);
                });


            }

            scope.scoreClass = function (x, y, max) {
                if(scope.matrice[x] && scope.matrice[x][y].score != null)
                    return scope.matrice[x][y].score != max ? scope.matrice[x][y].score != 0 ? "chip-warning" : "chip-error" : "chip-valide";
                return "chip-default"

            }

            scope.getGrainScore = function (x, y) {
                if(scope.matrice[x])
                    return scope.matrice[x][y].score;
                return null;
            }

            scope.getGrainList = function (copyId) {
                return scope.matrice[copyId] ? scope.matrice[copyId] : scope.scheduledGrains;
            }

            scope.grainTypeFilter = function(grain) {
                return grain.grain_type_id > 3
            }

            scope.close = function() {
                scope.isDisplayed = false;
            };

            scope.order = {};

            scope.order.order = function(item){
                if(scope.order.isGrain){
                    if(scope.matrice[item.id] && scope.matrice[item.id][scope.order.field].score != null)
                        return scope.matrice[item.id][scope.order.field].score;
                    return -1
                }
                return (item[scope.order.field] != null) ? item[scope.order.field] : -1;
            };

            scope.orderByField = function(fieldName, grain?){
                scope.order.isGrain = grain;
                if(fieldName === scope.order.field){
                    scope.order.desc = !scope.order.desc;
                }
                else{
                    scope.order.desc = false;
                    scope.order.field = fieldName;
                }
            };
        }
    };
}]
);
