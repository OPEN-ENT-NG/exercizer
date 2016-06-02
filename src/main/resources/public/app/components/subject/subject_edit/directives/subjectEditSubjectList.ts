directives.push(
    {
        name: 'subjectEditSubjectList',
        injections: [
            'FolderService',
            (FolderService
             ) => {
                return {
                    restrict: 'E',
                    scope: {
                    },
                    templateUrl: 'exercizer/public/app/components/subject/subject_edit/templates/subject-edit-subject-list.html',
                    link: (scope:any) => {

                        scope.folderList = function () {
                            return FolderService.folderList;
                        };

                    }
                };
            }
        ]
    }
);
