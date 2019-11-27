import { ng, notify } from 'entcore';
import { moment } from 'entcore';
import { _ } from 'entcore';

export const dashboardArchivesCopyList = ng.directive('dashboardArchivesCopyList', ['SubjectCopyService', '$location', 'ArchivesService', 'GroupService','DateService','$q', (SubjectCopyService, $location, ArchivesService, GroupService, DateService, $q) => {
    return {
        restrict: 'E',
        scope: {
            selectedSubjectScheduled : "="
        },
        templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_archive/templates/dashboard-archives-copy-list.html',
        link: (scope:any) => {



            scope.$watch('selectedSubjectScheduled', function(newValue, oldValue) {
                if(scope.selectedSubjectScheduled){
                    init(scope.selectedSubjectScheduled);
                    /**
                     * INIT
                     */
                    scope.toasterDisplayed = false;
                    scope.search = {};

                    resetRemind();

                    scope.order.field = 'owner_username';
                    scope.order.desc = false;
                }
            });

            scope.$on('$locationChangeSuccess' , ()=> {
                if(scope.selectedSubjectScheduled && $location.path() !== '/dashboard/teacher/archive/'+scope.selectedSubjectScheduled.id)
                    scope.selectedSubjectScheduled = undefined;
            })

            function init(subjectScheduled){
                ArchivesService.getListArchivedSubjectScheduledCopy(subjectScheduled.id , (array => {
                    scope.subjectCopyList = array;
                    let r = _.map(_.union(scope.selectedSubjectScheduled.scheduled_at.userList, scope.selectedSubjectScheduled.scheduled_at.groupList), _.clone);

                    let total = r.length;
                    let current = 1;
                    _.forEach(r, function (obj) {
                        if (total !== current) obj.name = obj.name + ' - ';
                        current++;
                    });

                    scope.lUserGroup = r;
                }))
            }

            function resetRemind() {
                scope.reminderDisplayed = false;
            };

            /**
             * EVENT
             */

            scope.selectCopy = function(){
                var res = false;
                angular.forEach(scope.subjectCopyList, function(copy){
                    if(copy.selected){
                        res = true
                    }
                });
                scope.toasterDisplayed =  res;
            };

            scope.clickSelectAll = function(selectAll){
                var count = 0;
                angular.forEach(scope.subjectCopyList, function(copy){
                    if(copy.submitted_date){
                        copy.selected = selectAll;
                        count++
                    }
                });
                if(count>0){
                    scope.toasterDisplayed =  selectAll;
                }
            };

            scope.clickOnCopy = function(copy){
                ArchivesService.setCurrentcopy(copy);
                $location.path('/dashboard/teacher/archive/'+scope.selectedSubjectScheduled.id +'/'+ copy.id+'/');
            };

            scope.clickReturnSubjectScheduledList = function(){
                scope.selectedSubjectScheduled = null;
                $location.path('/dashboard/teacher/correction');
            };

            scope.applyAutomaticMark = function(){
                var promises = [];
                angular.forEach(scope.subjectCopyList, function(copy){
                    if(SubjectCopyService.canCorrectACopyAsTeacher(scope.selectedSubjectScheduled, copy) && copy.selected){
                        copy.is_corrected = true;
                        promises.push(SubjectCopyService.correct(copy));
                    }
                });
                $q.all(promises).then(
                    function(data){
                        angular.forEach(scope.subjectCopyList, function(copy){
                            copy.selected = false;
                        });
                        scope.toasterDisplayed =  false;
                        scope.selectAll = false
                    }
                );
            };

            /**
             * DISPLAY
             */

            scope.selectTitle = function (copy){
                if(copy.submitted_date){
                    return 'correction'
                } else{
                    return 'text'
                }
            };

            scope.numberCopyNotCorrected = function(){
                var res = 0;
                angular.forEach(scope.subjectCopyList, function(copy){
                    if(!copy.is_corrected){
                        res++;
                    }
                });
                return res;
            };

            scope.numberCopySubmitted = function(){
                var res = 0;
                angular.forEach(scope.subjectCopyList, function(copy){
                    if(copy.submitted_date){
                        res++;
                    }
                });
                return res;
            };

            scope.tooLate = function(copy){
                if(copy.submitted_date && scope.selectedSubjectScheduled && scope.selectedSubjectScheduled.due_date){
                    return DateService.compare_after(DateService.isoToDate(copy.submitted_date), DateService.isoToDate(scope.selectedSubjectScheduled.due_date), false, scope.selectedSubjectScheduled.use_time);
                } else{
                    return false;
                }
            };

            scope.order = {};

            scope.order.order = function(item){
                if(scope.order.field === 'submitted_date' && item.submitted_date){
                    return moment(item.submitted_date);
                } else if (scope.order.field === 'state') {
                    let res = scope.copyStateText(item);
                    return (res === '' ? undefined : res);
                }

                if(scope.order.field.indexOf('.') >= 0){
                    var splitted_field = scope.order.field.split('.')
                    var sortValue = item
                    for(var i = 0; i < splitted_field.length; i++){
                        sortValue = (typeof sortValue === 'undefined' || sortValue === null) ? undefined : sortValue[splitted_field[i]]
                    }
                    return sortValue
                } else
                    return (item[scope.order.field]) ? item[scope.order.field] : undefined;
            };

            scope.orderByField = function(fieldName){
                if(fieldName === scope.order.field){
                    scope.order.desc = !scope.order.desc;
                }
                else{
                    scope.order.desc = false;
                    scope.order.field = fieldName;
                }
            };

            scope.downloadFile = function(copy){
                window.location.href = SubjectCopyService.downloadSimpleCopy(copy.id);
            };

            scope.downloadGeneralCorrectedFile = function() {
                window.location.href = '/exercizer/subject-scheduled/corrected/download/' + scope.selectedSubjectScheduled.id;
            };

            scope.downloadCorrectedFile = function(subjectCopy) {
                window.location.href = '/exercizer/subject-copy/corrected/download/' + subjectCopy.id;
            };

            scope.downloadFiles = function(){
                var possible = false;

                var downloadCopies = [];

                angular.forEach(scope.subjectCopyList, function(copy){
                    if(copy.selected){
                        if (copy.submitted_date !== null) {
                            possible=true;
                            downloadCopies.push(copy.id);
                        }
                    }
                });

                if (!possible) {
                    notify.info("exercizer.service.check.download.copy");
                } else {
                    window.location.href = SubjectCopyService.downloadSimpleCopies(downloadCopies);
                }
            };

            scope.option = {};

            scope.switchMode = function () {
                if (scope.option.mode == 'simple') {
                    scope.option.mode = 'full';
                } else {
                    scope.option.mode = 'simple';
                }
            }

            scope.export = function () {
                scope.$emit('E_EXPORT_STATS', { subjectScheduled: scope.selectedSubjectScheduled, mode: scope.option.mode });
            }
        }
    };
}]
);
