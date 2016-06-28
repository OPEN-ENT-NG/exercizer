directives.push(
    {
        name: 'teacherDashboardPublishToLibrary',
        injections: ['SubjectLibraryService', 'SubjectLessonTypeService', 'SubjectLessonLevelService', 'SubjectTagService', (SubjectLibraryService, SubjectLessonTypeService, SubjectLessonLevelService, SubjectTagService) => {
            return {
                restrict: 'E',
                templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-publish-to-library.html',
                link: (scope:any) => {

                    scope.isDisplayed = false;
                    scope.hasAgreedToPublish = false;
                    scope.subject = null;
                    scope.selectedSubjectLessonType = null;
                    scope.selectedSubjectLessonLevel = null;
                    scope.subjectLessonTypeList = [];
                    scope.subjectLessonLevelList = [];
                    scope.subjectTagList = [];
                    scope.selectedSubjectTagList = [];

                    // event to display model
                    scope.$on('E_DISPLAY_MODAL_PUBLISH_TO_LIBRARY', function(event, subject:ISubject) {
                        scope.subject = subject;

                        SubjectLessonTypeService.resolve(
                            function() {
                                scope.subjectLessonTypeList = SubjectLessonTypeService.getList();

                                SubjectLessonLevelService.resolve(
                                    function() {
                                        scope.subjectLessonLevelList = SubjectLessonLevelService.getList();

                                        SubjectTagService.resolve(
                                            function(subjectTagList:ISubjectTag[]) {
                                                scope.subjectTagList = subjectTagList;
                                                scope.isDisplayed = true;
                                                
                                            },
                                            function(err) {
                                                notify.error(err);
                                            }
                                        );
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                );
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );

                    });
                    
                    scope.toggleHasAgreedToPublish = function() {
                        scope.hasAgreedToPublish = !scope.hasAgreedToPublish;
                    };

                    scope.selectSubjectTag = function(selectedSubjectTag:ISubjectTag) {
                        if (scope.selectedSubjectTagList.indexOf(selectedSubjectTag) !== -1) {
                            scope.selectedSubjectTagList.push(selectedSubjectTag);
                        } else {
                            console.log(selectedSubjectTag);
                        }
                    };
                    
                    scope.removeFromSelectedSubjectTagList = function(subjectTag:ISubjectTag) {
                        var subjectTagIndex = scope.selectedSubjectTagList.indexOf(subjectTag);
                        scope.selectedSubjectTagList.splice(1, subjectTagIndex);
                    };

                    // hide modal
                    scope.hide = function () {
                        scope.isDisplayed = false;
                        scope.hasAgreedToPublish = false;
                        scope.subject = null;
                        scope.selectedSubjectLessonType = null;
                        scope.selectedSubjectLessonLevel = null;
                        scope.subjectLessonTypeList = [];
                        scope.subjectLessonLevelList = [];
                        scope.subjectTagList = [];
                        scope.selectedSubjectTagList = [];
                        scope.$emit('E_RESET_SELECTED_LIST');
                    };
                }
            };
        }]
    }
);
