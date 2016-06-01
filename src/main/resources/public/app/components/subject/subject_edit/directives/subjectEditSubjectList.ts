directives.push(
    {
        name: 'subjectEditSubjectList',
        injections: [
            'FolderService',
            'E_PREVIEW_PERFORM_SUBJECT_COPY',
            'E_FOLD_GRAIN_LIST',
            'E_REFRESH_GRAIN_LIST',
            'E_UPDATE_GRAIN',
            (FolderService,
             E_PREVIEW_PERFORM_SUBJECT_COPY,
             E_FOLD_GRAIN_LIST,
             E_REFRESH_GRAIN_LIST,
            E_UPDATE_GRAIN
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
