directives.push(
    {
        name: 'subjectEditSubjectList',
        injections: [
            'FolderService','SubjectService','GrainService','GrainTypeService',
            (FolderService, SubjectService, GrainService, GrainTypeService
             ) => {
                return {
                    restrict: 'E',
                    templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-subject-list.html',
                    link: (scope:any) => {

                        scope.autocomplete = {
                            subjectList: null
                        };

                        scope.grainList = [];
                        scope.isFolded = true;
                        
                        scope.subjectList = function () {
                            return SubjectService.getList();
                        };

                        scope.getGrainIllustrationURL = function(grainTypeId:number) {
                            return GrainTypeService.getIllustrationURL(grainTypeId);
                        };
                        
                        scope.getGrainName = function (grain:IGrain) {
                            if (grain.grain_data && grain.grain_data.title) {
                                return grain.grain_data.title;
                            } else {
                                var grainType = GrainTypeService.getById(grain.grain_type_id);
                                return grainType.public_name;
                            }
                        };

                        scope.toggle = function () {
                            scope.isFolded = !scope.isFolded;
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

                        /**
                         * DRAG
                         */

                        scope.drag = function (item, $originalEvent) {
                            try {
                                $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
                            } catch (e) {
                                $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
                            }
                        };
                    }
                };
            }
        ]
    }
);
