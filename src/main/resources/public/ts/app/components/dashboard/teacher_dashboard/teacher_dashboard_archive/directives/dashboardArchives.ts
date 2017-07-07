import { moment } from 'entcore/libs/moment/moment';
import { ng, skin } from 'entcore';

import { ISubjectScheduled } from '../../../../../models/domain';

export const dashboardArchives = ng.directive('dashboardArchives', [ '$location', '$window', 'DateService', 'ArchivesService', 'SubjectCopyService', ($location, $window, DateService, ArchivesService, SubjectCopyService) => {
        return {
            restrict: 'E',
            scope: {
                selectedSubjectScheduled : "=",
                subjectScheduledList : "="
            },
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_archive/templates/dashboard-archives.html',
            link: (scope:any) => {

                scope.search = {
                    groupList: [],
                    beginDate: moment().subtract(3, 'month').toDate(),
                    endDate: moment().add(3, 'month').toDate(),
                };


                scope.selectedSubjectsScheduled=[];



                scope.getSubjectScheduledPicture = function (subjectScheduled) {
                    return subjectScheduled.picture || skin.basePath + 'img/illustrations/image-default.svg';
                };


                scope.filterOnSubjectScheduledDueDate = function (begin, end) {
                    return function (subjectScheduled) {
                        var dueDate = DateService.isoToDate(subjectScheduled.due_date);
                        if (!begin || !end) {
                            throw "begin or end date in params missing"
                        }
                        return DateService.compare_after(dueDate, begin, true) && DateService.compare_after(end, dueDate, true);
                    }
                };

                scope.orderByCopyListModificationDate = function(id){
                    var copyList = ArchivesService.getSubjectScheduledCopyById(id);
                    var lastUpdateCopy:any = null;
                    angular.forEach(copyList, function(copy){
                        if(lastUpdateCopy){
                            if(DateService.compare_after(DateService.isoToDate(copy.modified), DateService.isoToDate(lastUpdateCopy))){
                                lastUpdateCopy = copy;
                            }
                        } else{
                            lastUpdateCopy = copy;
                        }
                    });
                    if(lastUpdateCopy !== null){
                        return lastUpdateCopy.modified;
                    }
                }


                scope.selectsubjectScheduled = function(subjectScheduled){
                    if(subjectScheduled.selected){
                        scope.selectedSubjectsScheduled.push(subjectScheduled);
                    }else{
                        scope.selectedSubjectsScheduled.pop(subjectScheduled);
                    }

                }
                scope.clickOnSubjectScheduled = function(subjectScheduled){
                    scope.selectedSubjectScheduled = subjectScheduled;
                    $location.path('/dashboard/teacher/archive/'+subjectScheduled.id);
                };

                scope.exportAll = function(){
                    exportCSV(scope.subjectScheduledList);
                };

                scope.exportSelected = function(){
                    exportCSV(scope.selectedSubjectsScheduled);
                }

                function exportCSV(subjects:ISubjectScheduled[]) {
                    var ids:string = "?"
                    subjects.forEach((subject) =>{
                        ids = ids.concat("id="+subject.id+"&");
                    } );
                    window.location.href = '/exercizer/archive/subjects-scheduled/export-csv' + ids.slice(0,-1);
                }
            }
        };
    }]
);
