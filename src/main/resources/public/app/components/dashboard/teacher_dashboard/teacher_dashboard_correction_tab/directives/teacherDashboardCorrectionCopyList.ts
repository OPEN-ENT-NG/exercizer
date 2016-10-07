directives.push(
    {
        name: 'teacherDashboardCorrectionCopyList',
        injections: ['SubjectCopyService', '$location', 'GroupService','DateService','$q', (SubjectCopyService, $location, GroupService, DateService, $q) => {
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
                        SubjectCopyService.resolveBySubjectScheduled_force(subjectScheduled).then(
                            function () {
                                scope.subjectCopyList = SubjectCopyService.getListBySubjectScheduled(subjectScheduled);
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
                        var count = 0;
                        angular.forEach(scope.subjectCopyList, function(copy){
                            if(!copy.is_corrected){
                                copy.selected = selectAll;
                                count++
                            }
                        });
                        if(count>0){
                            scope.toasterDisplayed =  selectAll;
                        }
                    };

                    scope.clickOnCopy = function(copy){
                        $location.path('/subject/copy/view/'+scope.selectedSubjectScheduled.subject_id +'/'+ copy.id+'/');
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
                        if(SubjectCopyService.canCorrectACopyAsTeacher(scope.selectedSubjectScheduled, copy)){
                            return 'correction'
                        } else{
                            return 'text'
                        }
                    };

                    scope.canCorrectACopyAsTeacher = function(copy){
                        return SubjectCopyService.canCorrectACopyAsTeacher(scope.selectedSubjectScheduled, copy);
                    };

                    scope.copyStateText = function(copy){
                        return SubjectCopyService.copyStateText(copy);
                    };

                    scope.copyStateBackGroundColorClass = function(copy){
                        return SubjectCopyService.copyStateBackGroundColorClass(copy);
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
