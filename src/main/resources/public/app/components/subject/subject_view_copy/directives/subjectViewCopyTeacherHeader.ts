directives.push(
    {
        name: 'subjectViewCopyTeacherHeader',
        injections: ['$location', 'template', 'SubjectCopyService', ($location, template, SubjectCopyService) => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    subjectCopy: '='                   
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_view_copy/templates/subject-view-copy-teacher-header.html',
                link:(scope:any) => {
                    var subjectCopyList:ISubjectCopy[] =
                        _.chain(SubjectCopyService.getListBySubjectScheduled(scope.subjectScheduled)).filter(function (subjectCopy) {
                            //filter only copy has submitted or due_date is past
                            return SubjectCopyService.canCorrectACopyAsTeacher(scope.subjectScheduled, subjectCopy);
                        }).sortBy( function(subjectCopy) {
                        return subjectCopy.owner_username;
                    }).value();
                    
                    scope.redirectToDashboard = function(isCorrected:boolean) {
                        if (isCorrected) {
                            var copy = SubjectCopyService.getById(scope.subjectCopy.id);
                            copy.is_correction_on_going = true;
                            copy.is_corrected = true;
                            scope.$emit('E_UPDATE_SUBJECT_COPY', copy, false);

                        } else {
                            $location.path('/dashboard/teacher/correction/'+scope.subjectScheduled.id);
                        }
                    };

                    scope.redirectToSubjectDashboard = function() {
                        $location.path('/dashboard');
                    };

                    scope.redirectToCorrectDashboard = function() {
                        $location.path('dashboard/teacher/correction');
                    };

                    scope.$on('E_SUBJECT_COPY_UPDATED', function(event, redirect:boolean) {
                        if (redirect) {
                            $location.path('/dashboard/teacher/correction/'+scope.subjectScheduled.id);
                        }
                    });

                    scope.copyIsCorrected = function(){
                        return scope.subjectCopy.is_corrected;
                    };
                    
                    function findCopyIndexOfCurrentCopy() {
                        return _.findIndex(subjectCopyList, function(subjectCopy) { return subjectCopy.id === scope.subjectCopy.id });
                    };

                    scope.redirectToNextCopy = function() {
                        template.close("main");
                        let index = findCopyIndexOfCurrentCopy() + 1;
                        $location.path('/subject/copy/view/'+ scope.subjectScheduled.subject_id + '/' +  subjectCopyList[index].id + '/');
                    };

                    scope.redirectToPreviousCopy = function() {
                        template.close("main");
                        let index = findCopyIndexOfCurrentCopy() - 1;
                        $location.path('/subject/copy/view/'+ scope.subjectScheduled.subject_id + '/' +  subjectCopyList[index].id + '/');
                    };

                    scope.hasNextCopy = function() {
                        return scope.subjectCopy.id !== subjectCopyList[subjectCopyList.length-1].id;
                    };

                    scope.hasPreviousCopy = function() {
                        return scope.subjectCopy.id !== subjectCopyList[0].id;
                    }
                }
            };
        }]
    }
);