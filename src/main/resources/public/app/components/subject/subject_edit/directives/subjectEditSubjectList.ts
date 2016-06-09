directives.push(
    {
        name: 'subjectEditSubjectList',
        injections: [
            'FolderService','SubjectService','GrainService',
            (FolderService, SubjectService, GrainService
             ) => {
                return {
                    restrict: 'E',
                    scope: {
                    },
                    templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-subject-list.html',
                    link: (scope:any) => {

                        scope.autocomplete = {
                            subjectList: null
                        };

                        scope.grainList = [];

                        /**
                         * GETTER
                         */

                        scope.subjectList = function () {
                            return SubjectService.getList();
                        };

                        /**
                         * AUTOCOMPLETE
                         */

                        scope.clickOnAutoComplete = function () {
                            if (scope.subjectList()) {
                                scope.autocomplete.subjectList = createListAutoComplete();
                            }
                        };

                        scope.clickOnItem = function(subjectFromAutoComplete){
                            scope.subject = SubjectService.getById(subjectFromAutoComplete.id);
                            GrainService.getListBySubject(scope.subject).then(
                                function(data){
                                    scope.grainList = data;
                                }
                            )

                        };

                        function createListAutoComplete() {
                            var array = [];
                            angular.forEach(scope.subjectList(), function (value) {
                                var folder = null,
                                    folderString = "";
                                if (value.folder_id) {
                                    folder = FolderService.folderById(value.folder_id);
                                    if (folder) {
                                        folderString = " (" + folder.label + ")";
                                    }
                                }
                                var obj = {
                                    title: value.title,
                                    name: value.title + folderString,
                                    id: value.id,
                                    toString: function () {
                                        return this.name;
                                    }
                                };
                                array.push(obj);
                            });
                            return array;
                        }


                    }
                };
            }
        ]
    }
);
