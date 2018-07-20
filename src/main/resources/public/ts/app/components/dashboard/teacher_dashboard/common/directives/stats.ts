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
                        scope.canUpIndex =  scope.filtredScheduledGrains.length > 6;
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
                                scope.scores.final.nb++;
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
                var diff = scope.filtredScheduledGrains.length-6-scope.index;
                if(5 < diff)
                    scope.index+=6;
                else {
                    scope.index += diff;
                    scope.canUpIndex = false;
                }
            }

            scope.downIndex = function(){
                if(5 < scope.index)
                    scope.index-=6;
                else
                    scope.index=0;
                scope.canUpIndex = true;
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

            scope.order = {field: 'owner_username'};

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
            
            scope.formatScore = function (val:number) {
                if(val != null)
                    return val.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0].replace(".",",");
                return '';
            }

            scope.exportCSV = function(){
                var scheduledGrains =scope.filtredScheduledGrains.sort((a, b) => {
                    return a.order_by - b.order_by;
                });
                var csvStr = "\ufeff";
                var i=0;
                csvStr+= scope.translate("exercizer.subject.title")+";";
                csvStr+= scope.translate("exercizer.export.subject.type")+";";
                csvStr+= scope.translate("exercizer.export.student.name")+";";
                scheduledGrains.forEach(grain => {
                    csvStr+="Q"+(++i)+">"+ (grain.grain_data.title ? grain.grain_data.title : '')+";";
                })
                csvStr+= scope.translate("exercizer.auto.score")+";";
                csvStr+= scope.translate("exercizer.final.score")+";";
                csvStr+= scope.translate("exercizer.export.subject.comment")+";";
                csvStr+= '\r\n';
                scope.subjectCopyList.forEach(copy => {
                    csvStr+= scope.subjectScheduled.title+";";
                    csvStr+= scope.translate("exercizer.interactive")+";";
                    csvStr+= copy.owner_username+";";
                    if(scope.matrice[copy.id]){
                        scheduledGrains.forEach(grain => {
                            csvStr+=scope.formatScore(scope.matrice[copy.id][grain.id].score)+";";
                        })
                    }else{
                        scheduledGrains.forEach(grain => {csvStr+=";";})
                    }
                    csvStr+= (copy.calculated_score != null ? scope.formatScore(copy.calculated_score) : '')+";";
                    csvStr+= (copy.final_score != null? scope.formatScore(copy.final_score) : '')+";";
                    csvStr+= (copy.comment != null ? copy.comment : '')+";";
                    csvStr+= '\r\n';
                });

                csvStr+= scope.translate("exercizer.schedule.stats.average")+";;;";
                scheduledGrains.forEach(grain => {
                    if(scope.scores[grain.id])
                        csvStr+= scope.scores[grain.id].nb > 0 ? scope.formatScore(scope.scores[grain.id].sum/scope.scores[grain.id].nb) : '';
                    csvStr+=";";
                })
                csvStr+= (scope.scores.auto.nb > 0 ? scope.formatScore(scope.scores.auto.sum/scope.scores.auto.nb) : '') +";";
                csvStr+= (scope.scores.final.nb > 0 ? scope.formatScore(scope.scores.final.sum/scope.scores.final.nb) : '') +";;";
                csvStr+= '\r\n';

                var blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, "export.csv");
                } else {
                    var link = document.createElement("a");
                    if (link.download !== undefined) { // feature detection
                        // Browsers that support HTML5 download attribute
                        var url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", scope.subjectScheduled.title+".csv");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }
            }

            scope.$on("EXPORT_STATS", function(event, subjectScheduled) {
                if(scope.subjectScheduled.id == subjectScheduled.id)
                    scope.exportCSV()
            });
        }
    };
}]
);
