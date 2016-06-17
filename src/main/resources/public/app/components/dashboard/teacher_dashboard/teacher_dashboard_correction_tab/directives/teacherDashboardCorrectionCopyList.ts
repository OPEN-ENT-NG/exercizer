directives.push(
    {
        name: 'teacherDashboardCorrectionCopyList',
        injections: ['SubjectCopyService', 'SubjectService', 'GroupService','DateService', (SubjectCopyService, SubjectService, GroupService, DateService) => {
            return {
                restrict: 'E',
                scope: {
                    selectedSubjectScheduled : "="
                },
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_correction_tab/templates/teacher-dashboard-correction-copy-list.html',
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

                    function init(subjectScheduled){
                        // TODO : set to true;
                        SubjectCopyService.resolve(false).then(
                            function () {
                                scope.subjectCopyList = [];
                                angular.forEach(SubjectCopyService.listMappedById, function(copy){
                                    if(copy.subject_scheduled_id == subjectScheduled.id){
                                        scope.subjectCopyList.push(copy);
                                    } else {
                                        // TODO remove
                                        scope.subjectCopyList.push(copy);

                                    }
                                });
                                console.log('subjectCopyList', scope.subjectCopyList);
                            }
                        );
                    }

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
                        angular.forEach(scope.subjectCopyList, function(copy){
                            copy.selected = selectAll
                        });
                        scope.toasterDisplayed =  selectAll;
                    };



                    /**
                     * DISPLAY
                     */

                    scope.correctionStateText = function(copy){
                        if(copy.is_corrected){
                            return 'Corrigé';
                        } else if(copy.is_correction_on_going){
                            return 'Correction en cours';
                        } else {
                            return 'A corriger';
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
                    }
                }
            };
        }]
    }
);
