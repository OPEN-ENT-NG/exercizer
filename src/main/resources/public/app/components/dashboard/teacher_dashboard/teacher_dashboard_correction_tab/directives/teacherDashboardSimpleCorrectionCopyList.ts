directives.push(
    {
        name: 'teacherDashboardSimpleCorrectionCopyList',
        injections: ['SubjectCopyService', 'SubjectScheduledService', '$location','DateService','$q', (SubjectCopyService, SubjectScheduledService, $location, DateService, $q) => {
            return {
                restrict: 'E',
                scope: {
                    selectedSubjectScheduled : "="
                },
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/templates/teacher-dashboard-simple-correction-copy-list.html',
                link: (scope:any) => {

                    scope.$watch('selectedSubjectScheduled', function(newValue, oldValue) {
                        if(scope.selectedSubjectScheduled){
                            init(scope.selectedSubjectScheduled);
                        }
                    });

                    /**
                     * INIT
                     */
                    scope.subjectCopyList = [];
                    scope.toasterDisplayed = false;
                    resetRemind();
                    
                 
                    function init(subjectScheduled){
                        SubjectCopyService.resolveBySubjectScheduled_force(subjectScheduled).then(
                            function () {
                                scope.subjectCopyList = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
                            }
                        );
                    };
                    
                    function resetRemind() {
                        scope.remind = {
                            reminderDisplayed:false,
                            step:'choose',
                            subject:'',
                            body:''
                        };                        
                    };

                    /**
                     * EVENT
                     */

                    scope.reminder = function(id){
                        scope.remind.step = 'choose';
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
                            notify.info("La séléction ne comporte pas de non-rendu");
                        } else {
                            scope.remind.reminderDisplayed=true;
                        }
                    };
                    
                    scope.sendReminder = function() {
                        var copyIds = [];
                        
                        angular.forEach(scope.reminderCopies, function(copy){                           
                            copyIds.push(copy.id);
                        });                        
                        
                        if (scope.remind.step === 'auto') {
                            SubjectCopyService.remindAutomaticCopies(copyIds, scope.selectedSubjectScheduled.id).then(
                                function () {
                                    resetRemind();
                                    notify.info('Le rappel a bien été envoyé');
                                },
                                function (err) {
                                    notify.error(err);
                                }                                
                            );
                        } else {
                            if (!scope.remind.subject || scope.remind.subject === '') {
                                notify.error('exercizer.reminder.check.subject');
                            } else if (!scope.remind.body || scope.remind.body === '') {
                                notify.error('exercizer.reminder.check.body');
                            } else {
                                SubjectCopyService.remindCustomCopies(copyIds, scope.remind.subject, scope.remind.body).then(
                                    function () {
                                        resetRemind();
                                        notify.info('Le rappel a bien été envoyé');
                                    },
                                    function (err) {
                                        notify.error(err);
                                    }
                                );
                            }
                        }
                    };

                    scope.closeReminder = function() {
                        resetRemind();
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
                            notify.info("La séléction ne comporte pas de rendu");
                        } else {                            
                            window.location.href = SubjectCopyService.downloadSimpleCopies(downloadCopies);
                        }
                    };

                    scope.downloadFile = function(copy){
                        window.location.href = SubjectCopyService.downloadSimpleCopy(copy.id);
                    };

                    scope.selectedCorrectedFileCopy = function(copy){
                        scope.selectedCopy = copy;
                    };

                    scope.selectCopy = function(){
                        var res = false;
                        angular.forEach(scope.subjectCopyList, function(copy){
                            if(copy.selected){
                                res = true;
                            }
                        });
                        scope.toasterDisplayed =  res;
                    };

                    scope.clickSelectAll = function(selectAll){
                        var count = 0;
                        angular.forEach(scope.subjectCopyList, function(copy) {
                            copy.selected = selectAll;
                            count++
                        });
                        if(count>0){
                            scope.toasterDisplayed =  selectAll;
                        }
                    };

                    scope.saveCorrected = function(event) {
                        scope.newFiles = event.newFiles;

                        if (scope.newFiles.length > 0) {
                            var file = scope.newFiles[0];
                            SubjectScheduledService.addCorrectedFile(scope.selectedSubjectScheduled.id, file).then(
                                function (fileId) {
                                    scope.selectedSubjectScheduled.corrected_metadata = {"filename":file.name};
                                    scope.selectedSubjectScheduled.corrected_file_id = fileId;
                                    angular.forEach(scope.subjectCopyList, function(copy){
                                        copy.is_corrected = true;
                                    });
                                    notify.info('La correction a bien été ajoutée');
                                },
                                function (err) {
                                    notify.error(err);
                                }
                            );
                        }
                    };

                    scope.removeCorrected = function() {
                        SubjectScheduledService.removeCorrectedFile(scope.selectedSubjectScheduled.id).then(
                            function () {
                                scope.selectedSubjectScheduled.corrected_metadata.filename = null;
                                scope.selectedSubjectScheduled.corrected_file_id = null;
                                angular.forEach(scope.subjectCopyList, function(copy){
                                    if (!copy.corrected_file_id) {
                                        copy.is_corrected = false;
                                    }
                                });
                                notify.info('La correction a bien été supprimée');
                            },
                            function (err) {
                                notify.error(err);
                            }
                        );
                    };

                    scope.saveCurrentCorrected = function(event) {
                        scope.newFiles = event.newFiles;

                        if (scope.newFiles.length > 0) {
                            var file = scope.newFiles[0];

                            SubjectCopyService.addCorrectedFile(scope.selectedCopy.id, file).then(
                                function (fileId) {
                                    scope.selectedCopy.corrected_metadata = {"filename":file.name};
                                    scope.selectedCopy.corrected_file_id = fileId;
                                    scope.selectedCopy.is_corrected = true;
                                    notify.info('La correction individuelle a bien été ajoutée');
                                },
                                function (err) {
                                    notify.error(err);
                                }
                            );
                        }
                    };

                    scope.removeCurrentCorrected = function(copy) {
                        SubjectCopyService.removeCorrectedFile(copy.id).then(
                            function () {
                                copy.corrected_metadata.filename = null;
                                copy.corrected_file_id = null;
                                if (!scope.selectedSubjectScheduled.corrected_file_id) {
                                    copy.is_corrected = false;
                                }
                                notify.info('La correction individuelle a bien été supprimée');
                            },
                            function (err) {
                                notify.error(err);
                            }
                        );
                    };


                    scope.clickReturnSubjectScheduledList = function(){
                        scope.selectedSubjectScheduled = null;
                        $location.path('/dashboard/teacher/correction');
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

                    scope.numberCopySubmitted = function(){
                        var res = 0;
                        angular.forEach(scope.subjectCopyList, function(copy){
                            if(copy.submitted_date){
                                res++;
                            }
                        });
                        return res;
                    }
                }
            };
        }]
    }
);
