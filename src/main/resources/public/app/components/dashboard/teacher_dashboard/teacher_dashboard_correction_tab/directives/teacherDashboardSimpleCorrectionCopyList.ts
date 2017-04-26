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
                            /**
                             * INIT
                             */
                            scope.subjectCopyList = [];
                            scope.toasterDisplayed = false;
                            scope.search = {};
                            resetRemind();
                            
                            scope.order.field = 'owner_username';
                            scope.order.desc = false;                            
                        }
                    });
                 
                    function init(subjectScheduled){
                        SubjectCopyService.resolveBySubjectScheduled_force(subjectScheduled).then(
                            function () {
                                scope.subjectCopyList = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
                            }
                        );
                    };

                    function resetRemind() {
                        scope.reminderDisplayed = false;
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
                            notify.info("La sélection ne comporte pas de non-rendu");
                        } else {
                            scope.reminderDisplayed = true;
                        }
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

                    scope.showReminder = function(copy) {
                        return !copy.submitted_date;
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
    }
);
