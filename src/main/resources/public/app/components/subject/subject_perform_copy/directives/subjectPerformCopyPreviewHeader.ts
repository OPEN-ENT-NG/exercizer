directives.push(
    {
        name: 'subjectPerformCopyPreviewHeader',
        injections: ['$location', 'SubjectCopyService', 'SubjectLibraryService', 'SubjectService', ($location, SubjectCopyService, SubjectLibraryService, SubjectService) => {
            return {
                restrict: 'E',
                scope: {
                    subjectScheduled: '=',
                    subjectCopy: '=',
                    grainScheduledList: '=',
                    grainCopyList: '=',
                    previewingFromLibrary: '='
                },
                templateUrl: 'exercizer/public/app/components/subject/subject_perform_copy/templates/subject-perform-copy-preview-header.html',
                link:(scope:any) => {
                    
                    scope.displayModalCopyPaste = function() {
                        if (scope.previewingFromLibrary) {
                            var subjectTmpArray = [];
                            subjectTmpArray.push(SubjectLibraryService.tmpSubjectForPreview);
                            scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE', subjectTmpArray, [], true);
                        }
                    };

                    scope.$on('E_CONFIRM_COPY_PASTE', function(event, folder:IFolder) {
                        if (scope.previewingFromLibrary) {
                            SubjectService.duplicate(SubjectLibraryService.tmpSubjectForPreview, folder).then(
                                function() {
                                    notify.info('Le sujet a bien été ajouté dans votre liste des sujets.');
                                    $location.path('/dashboard/teacher/library');
                                },
                                function(err) {
                                    notify.error(err);
                                }
                            );
                        }
                    });

                    scope.redirectToTeacherDashboardLibraryTab = function() {
                        if (scope.previewingFromLibrary) {
                            $location.path('/dashboard/teacher/library');
                        }
                    };

                    scope.redirectToSubjectEdit = function() {
                        if (!scope.previewingFromLibrary) {
                            $location.path('/subject/edit/' + scope.subjectScheduled.subject_id + '/');
                        }
                    };
                    
                    scope.redirectToSubjectPreviewViewCopy = function() {
                        SubjectCopyService.tmpPreviewData = {
                            subjectScheduled: scope.subjectScheduled,
                            subjectCopy: scope.subjectCopy,
                            grainScheduledList: scope.grainScheduledList,
                            grainCopyList: scope.grainCopyList,
                        };

                        $location.path('/subject/copy/view/preview/' + scope.subjectScheduled.subject_id + '/');
                    };
                }
            };
        }]
    }
);