directives.push(
    {
        name: 'teacherDashboardPublishToLibrary',
        injections: ['SubjectLibraryService', 'SubjectLessonTypeService', 'SubjectLessonLevelService', 'SubjectTagService',
            (SubjectLibraryService:ISubjectLibraryService, SubjectLessonTypeService:ISubjectLessonTypeService, SubjectLessonLevelService:ISubjectLessonLevelService, SubjectTagService:ISubjectTagService) => {
                return {
                    restrict: 'E',
                    templateUrl: 'exercizer/public/app/components/dashboard/teacher_dashboard/teacher_dashboard_subject_tab/templates/teacher-dashboard-publish-to-library.html',
                    link: (scope:any) => {

                        scope.isDisplayed = false;
                        scope.cc = {
                            authorsContributors: undefined
                        };
                        scope.hasAgreedToPublish = true;
                        scope.isPublicationOnGoing = false;
                        scope.subject = null;
                        scope.selection = {
                            selectedSubjectLessonTypeId: null,
                            selectedSubjectLessonLevelId: null
                        };
                        scope.selectedSubjectLessonTypeId = null;
                        scope.selectedSubjectLessonLevelId = null;
                        scope.subjectLessonTypeList = [];
                        scope.subjectLessonLevelList = [];
                        scope.subjectTagList = [];
                        scope.autocompleteSubjectTagList = [];
                        scope.selectedSubjectTagList = [];


                        // event to display modal
                        scope.$on('E_DISPLAY_MODAL_PUBLISH_TO_LIBRARY', function(event, subject:ISubject) {
                            scope.subject = subject;

                            SubjectLessonTypeService.resolve().then(
                                function() {
                                    scope.subjectLessonTypeList = SubjectLessonTypeService.getList();

                                    SubjectLessonLevelService.resolve().then(
                                        function() {
                                            scope.subjectLessonLevelList = SubjectLessonLevelService.getList();

                                            SubjectTagService.resolve().then(
                                                function(subjectTagList:ISubjectTag[]) {
                                                    scope.subjectTagList = subjectTagList;

                                                    angular.forEach(scope.subjectTagList, function(value) {
                                                        var obj = {
                                                            id: value.id,
                                                            label: value.label,
                                                            toString: function () {
                                                                return this.label;
                                                            }
                                                        };
                                                        scope.autocompleteSubjectTagList.push(obj);
                                                    });

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

                        scope.selectSubjectLessonLevel = function(selectedSubjectLessonLevel) {
                            console.log(selectedSubjectLessonLevel);
                            scope.selectedSubjectLessonLevelId = selectedSubjectLessonLevel;
                        };

                        scope.selectSubjectTag = function(selectedSubjectTagObject) {
                            for (var i = 0; i < scope.subjectTagList.length; ++i) {

                                if (scope.subjectTagList[i].id === parseInt(selectedSubjectTagObject.id)) {

                                    if (scope.selectedSubjectTagList.indexOf(scope.subjectTagList[i]) === -1) {
                                        scope.selectedSubjectTagList.push(scope.subjectTagList[i]);
                                    } else {
                                        notify.info('Cette étiquette est déjà associée.')
                                    }

                                    i = scope.subjectTagList.length;
                                }
                            }
                        };

                        scope.addNewSubjectTag = function(newCustomTagLabel:string) {
                            newCustomTagLabel = StringISOHelper.toISO(newCustomTagLabel);

                            if (!angular.isUndefined(newCustomTagLabel)) {

                                var isExisting = false;

                                for (let i = 0; i < scope.subjectTagList.length; ++i) {
                                    if (CompareStringHelper.compare(StringISOHelper.toISO(scope.subjectTagList[i].label), newCustomTagLabel)) {
                                        notify.info('Cette étiquette existe déjà.');
                                        i = scope.subjectTagList.length;
                                        isExisting = true;
                                    }
                                }

                                if (!isExisting) {

                                    var newSubjectTag = new SubjectTag(undefined, newCustomTagLabel);

                                    isExisting = false;

                                    for (let i = 0; i < scope.selectedSubjectTagList.length; ++i) {
                                        if (CompareStringHelper.compare(StringISOHelper.toISO(scope.selectedSubjectTagList[i].label), newCustomTagLabel)) {
                                            notify.info('Cette étiquette est déjà associée.');
                                            i = scope.selectedSubjectTagList.length;
                                            isExisting = true;
                                        }
                                    }

                                    if (!isExisting) {
                                        scope.selectedSubjectTagList.push(newSubjectTag);
                                    }
                                }
                            }
                        };

                        scope.removeFromSelectedSubjectTagList = function(subjectTag:ISubjectTag) {
                            var subjectTagIndex = scope.selectedSubjectTagList.indexOf(subjectTag);
                            scope.selectedSubjectTagList.splice(subjectTagIndex, 1);
                        };

                        scope.publish = function() {
                            if (!scope.hasAgreedToPublish) {
                                notify.error('Vous devez acceptez de publier votre sujet en Creative Commons.')
                            } else if (scope.selection.selectedSubjectLessonTypeId === null || scope.selection.selectedSubjectLessonTypeId === 'null' || scope.selection.selectedSubjectLessonLevelId === null || scope.selection.selectedSubjectLessonLevelId === 'null') {
                                notify.error('Vous devez sélectionner une matière et un niveau.')
                            } else {
                                scope.isPublicationOnGoing = true;
                                SubjectLibraryService.publish(scope.subject, StringISOHelper.toISO(scope.cc.authorsContributors), scope.selection.selectedSubjectLessonTypeId, scope.selection.selectedSubjectLessonLevelId, scope.selectedSubjectTagList).then(
                                    function() {
                                        scope.isPublicationOnGoing = false;
                                        notify.info('Votre sujet a bien été publié dans la bibliothèque.');
                                        scope.hide();
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                );
                            }
                        };

                        // hide modal
                        scope.hide = function () {
                            if (!scope.isPublicationOnGoing) {
                                scope.isDisplayed = false;
                                scope.hasAgreedToPublish = true;
                                scope.cc = {
                                    authorsContributors: undefined
                                };
                                scope.isPublicationOnGoing = false;
                                scope.subject = null;
                                scope.selection = {
                                    selectedSubjectLessonTypeId: null,
                                    selectedSubjectLessonLevelId: null
                                };
                                scope.subjectLessonTypeList = [];
                                scope.subjectLessonLevelList = [];
                                scope.subjectTagList = [];
                                scope.autocompleteSubjectTagList = [];
                                scope.selectedSubjectTagList = [];
                                scope.$emit('E_RESET_SELECTED_LIST');
                            }
                        };
                    }
                };
            }]
    }
);
