import { ng, notify, $, Document, MediaLibrary } from 'entcore';
import { moment } from 'entcore';
import { _ } from 'entcore';
import { ISubjectCopy } from '../../../../../models/domain';
import { ISubjectCopyFile } from '../../../../../models/domain/SubjectCopyFile';
import { ISubjectDocument } from '../../../../../models/domain/SubjectDocument';

export const teacherDashboardSimpleCorrectionCopyList = ng.directive('teacherDashboardSimpleCorrectionCopyList',
    ['SubjectCopyService', 'SubjectScheduledService', '$location','DateService','$q', '$filter', (SubjectCopyService, SubjectScheduledService, $location, DateService, $q, $filter) => {
        return {
            restrict: 'E',
            scope: {
                selectedSubjectScheduled : "="
            },
            templateUrl: 'exercizer/public/ts/app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/templates/teacher-dashboard-simple-correction-copy-list.html',
            link: (scope:any) => {
                const safeApply = function(fn?) {
                    try {
                        const phase = scope.$root && scope.$root.$$phase;
                        if (phase == '$apply' || phase == '$digest') {
                            if (fn && (typeof (fn) === 'function')) {
                                fn();
                            }
                        } else {
                            scope.$apply(fn);
                        }
                    } catch (e) { }
                };
            
                scope.$watch('selectedSubjectScheduled', function(newValue, oldValue) {
                    if(scope.selectedSubjectScheduled){
                        init(scope.selectedSubjectScheduled);
                        /**
                         * INIT
                         */
                        scope.subjectCopyList = [];
                        scope.toasterDisplayed = {main: false, exclude: false};
                        scope.search = {};

                        scope.fileSelectionDisplayed = false;
                        scope.selectedFile = { file: {}, visibility: 'protected' };
                        resetDisplay();
                        
                        scope.order.field = 'owner_username';
                        scope.order.desc = false;
                        scope.option = {
                            begin_date: new Date(scope.selectedSubjectScheduled.begin_date),
                            due_date: new Date(scope.selectedSubjectScheduled.due_date),
                            corrected_date: new Date(scope.selectedSubjectScheduled.corrected_date),
                            begin_time: $filter('date')(scope.selectedSubjectScheduled.begin_date, 'HH:mm'),
                            due_time: $filter('date')(scope.selectedSubjectScheduled.due_date, 'HH:mm'),
                            corrected_time: $filter('date')(scope.selectedSubjectScheduled.corrected_date, 'HH:mm')
                        }

                        //disabled drag/drop browser feacture
                        $('html, body').on('drop', (e) => e.preventDefault());
                        $('html, body').on('dragover', (e) => e.preventDefault());

                        //enabled just for simple-correction-id
                        $('#simple-correction-id').on('dragenter', (e) => e.preventDefault());
                        
                        $('#simple-correction-id').on('dragover', (e) => {
                            $('#simple-correction-id').addClass('dragover');
                            e.preventDefault();
                        });

                        $('#simple-correction-id').on('dragleave', () => {
                            $('#simple-correction-id').removeClass('dragover');
                        });

                        //TODO WB-582 $('#simple-correction-id').on('drop', dropFiles);
                    }
                });

                /*TODO WB-582 When a file is dropped in the drop zone (#simple-correction-id)
                const dropFiles = async (e) => {
                    if(!e.originalEvent.dataTransfer.files.length){
                        return;
                    }
                    const $dropTgt = $('#simple-correction-id');
                    $dropTgt.removeClass('dragover').addClass('loading-panel');
                    e.preventDefault();
                    scope.uploadFiles(e.originalEvent.dataTransfer.files);
                    scope.$apply();
                    $dropTgt.removeClass('loading-panel');
                };
                */
                
                function init(subjectScheduled){
                    SubjectCopyService.resolveBySubjectScheduled_force(subjectScheduled).then(
                        function () {
                            scope.subjectCopyList = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
                        }
                    );

                    let r = _.map(_.union(scope.selectedSubjectScheduled.scheduled_at.userList, scope.selectedSubjectScheduled.scheduled_at.groupList), _.clone);

                    let total = r.length;
                    let current = 1;
                    _.forEach(r, function (obj) {
                        if (total !== current) obj.name = obj.name + ' - ';
                        current++;
                    });
                    
                    scope.lUserGroup = r; 
                };

                function resetDisplay() {
                    scope.reminderDisplayed = false;
                    scope.excludeDisplayed = false;
                    scope.fileSelectionDisplayed = false;
                    scope.homeworksDisplayed = false;
                };

                /**
                 * EVENT
                 */

                scope.reminder = function(id){
                    var possible = false;

                    scope.reminderCopies = [];

                    angular.forEach(scope.subjectCopyList, function(copy){
                        if(copy.selected || copy.id === id){
                            if (copy.submitted_date === null) {
                                possible=true;
                                scope.reminderCopies.push(copy);
                            }
                        }
                    });

                    if (!possible) {
                        notify.info("exercizer.service.check.reminder");
                    } else {
                        scope.reminderDisplayed = true;
                    }
                };

                scope.exclude = function() {
                    scope.excludeDisplayed = true;
                };
                scope.downloadCorrectedFile = function (file:ISubjectDocument) {
                    window.location.href = `/exercizer/subject/${scope.selectedSubjectScheduled.id}/file/${file.doc_id}`;
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

                scope.downloadFile = function(copy, file:ISubjectCopyFile){
                    window.location.href = SubjectCopyService.downloadSimpleCopy(copy.id, file.file_id);
                };

                scope.selectedCorrectedFileCopy = function(copy){
                    scope.selectedCopy = copy;
                };

                scope.showHomeworks = function(copy) {
                    scope.selectedCopy = copy;
                    scope.homeworksDisplayed = true;
                }

                scope.selectCopy = function(){
                    var res = false;
                    scope.toasterDisplayed.exclude = true;
                    angular.forEach(scope.subjectCopyList, function(copy){
                        if(copy.selected){
                            res = true;
                            if (copy.submitted_date) {
                                scope.toasterDisplayed.exclude = false;
                                return false;
                            }
                        }
                    });
                    scope.toasterDisplayed.main =  res;
                };

                scope.clickSelectAll = function(selectAll){
                    var count = 0;
                    angular.forEach(scope.subjectCopyList, function(copy) {
                        copy.selected = selectAll;
                        count++
                    });
                    if(count>0){
                        scope.toasterDisplayed.main =  selectAll;
                    }

                    scope.toasterDisplayed.exclude = false;
                };

                // 
                scope.appendCorrected = async function() {
                    const file = scope.selectedFile.file;
                    //alert( JSON.stringify(file) );
                    if(!file){
                        return;
                    }
                    SubjectScheduledService.addCorrectedFile(scope.selectedSubjectScheduled.subject_id, file).then(
                        function (doc:ISubjectDocument) {
                            scope.selectedSubjectScheduled.files.push(doc);
                            angular.forEach(scope.subjectCopyList, function(copy){
                                copy.is_corrected = true;
                            });
                            notify.info('exercizer.service.save.corrected');
                        },
                        function (err) {
                            notify.error(err);
                        }
                    );
                };

                scope.removeCorrected = function(file:ISubjectDocument) {
                    SubjectScheduledService.removeCorrectedFile(scope.selectedSubjectScheduled.subject_id, file.doc_id).then(
                        function () {
                            const idx = scope.selectedSubjectScheduled.files.findIndex( f => f.doc_id===file.doc_id );
                            if( idx >= 0 ) {
                                scope.selectedSubjectScheduled.files.splice( idx, 1 );
                            }
                            angular.forEach(scope.subjectCopyList, function(copy){
                                if (!copy.corrected_files.length) {
                                    copy.is_corrected = false;
                                }
                            });
                            notify.info('exercizer.service.delete.corrected');
                        },
                        function (err) {
                            notify.error(err);
                        }
                    );
                };

                scope.saveCurrentCorrected = function(event) {
                    scope.newFiles = event.newFiles;

                    setTimeout(() => {
                        if (scope.newFiles.length > 0) {
                            var file = scope.newFiles[0];
                            SubjectCopyService.addCorrectedFile(scope.selectedCopy.id, file).then(
                                function (f:ISubjectCopyFile) {
                                    scope.selectedCopy.corrected_files.push( f );
                                    scope.selectedCopy.is_corrected = true;
                                    notify.info('exercizer.service.save.individual.corrected');
                                    safeApply();
                                },
                                function (err) {
                                    notify.error(err);
                                    safeApply();
                                }
                            );
                        }
                    }, 50);
                };

                scope.removeCurrentCorrected = function(copy, file:ISubjectCopyFile) {
                    SubjectCopyService.removeCorrectedFile(copy.id, file.file_id).then(
                        function () {
                            const idx = copy.corrected_files.findIndex( f => f.file_id===file.file_id );
                            if( idx >= 0 ) {
                                copy.corrected_files.splice( idx, 1 );
                            }
                            if (!scope.selectedSubjectScheduled.files.length) {
                                copy.is_corrected = false;
                            }
                            notify.info('exercizer.service.delete.individual.corrected');
                        },
                        function (err) {
                            notify.error(err);
                        }
                    );
                };

                scope.unScheduled = function() {
                    scope.option.unScheduledDisabled = true
                    SubjectScheduledService.unScheduled(scope.selectedSubjectScheduled).then(function () {
                        scope.option.unScheduledDisabled = false
                        notify.info("exercizer.service.unschedule");
                        scope.option.showUnScheduled=false;
                        window.location.reload();
                    }, function (err) {
                        notify.error(err);
                    });
                };

                scope.checkTime = function (time, def) {
                    return time.match("^([01][0-9]|2[0-3]):[0-5][0-9]$") ? time : $filter('date')(def, 'HH:mm');
                }

                scope.cancelDatesEditing = function () {
                    scope.option.editedDates = false;
                    scope.option.begin_date = new Date(scope.selectedSubjectScheduled.begin_date);
                    scope.option.due_date = new Date(scope.selectedSubjectScheduled.due_date);
                    scope.option.corrected_date = new Date(scope.selectedSubjectScheduled.corrected_date);
                    scope.option.begin_time = $filter('date')(scope.selectedSubjectScheduled.begin_date, 'HH:mm');
                    scope.option.due_time = $filter('date')(scope.selectedSubjectScheduled.due_date, 'HH:mm');
                    scope.option.corrected_time = $filter('date')(scope.selectedSubjectScheduled.corrected_date, 'HH:mm');
                }

                scope.modifySchedule = function () {
                    var subjectScheduled = {
                        id:scope.selectedSubjectScheduled.id,
                        begin_date:moment(scope.option.begin_date).hours(14).minutes(0).seconds(0)
                            .toISOString().replace(/T..:../, "T"+scope.option.begin_time),
                        due_date:moment(scope.option.due_date).hours(14).minutes(0).seconds(0)
                            .toISOString().replace(/T..:../, "T"+scope.option.due_time),
                        corrected_date: moment(scope.option.corrected_date).hours(14).minutes(0).seconds(0)
                            .toISOString().replace(/T..:../, "T"+scope.option.corrected_time)
                    };
                    SubjectScheduledService.modifySchedule(subjectScheduled).then(
                        function() {
                            window.location.reload();
                        },
                        function(err) {
                            notify.error(err);
                        }
                    );
                }

                scope.seeAllAssignAtList = function(){
                    scope.assignDisplayed=true;
                };
                /**
                 * DISPLAY
                 */
                scope.tooLate = function(copy){
                    if(copy.submitted_date && scope.selectedSubjectScheduled && scope.selectedSubjectScheduled.due_date){
                        return DateService.compare_after(DateService.isoToDate(copy.submitted_date), DateService.isoToDate(scope.selectedSubjectScheduled.due_date), false);
                    } else{
                        return false;
                    }
                };

                scope.showReminder = function(copy) {
                    return !copy.submitted_date;
                };

                scope.numberCopySubmitted = function(){
                    var res = 0;
                    angular.forEach(scope.subjectCopyList, function(copy){
                        if(copy.submitted_date){
                            scope.option.hasSubmitted = true;
                            res++;
                        }
                    });
                    return res;
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

                scope.order = {};

                scope.order.order = function(item){
                    if(scope.order.field === 'submitted_date' && item.submitted_date){
                        return moment(item.submitted_date);
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
            }
        };
    }]
);
