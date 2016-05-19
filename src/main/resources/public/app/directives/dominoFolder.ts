directives.push(
    {
        name: "dominoFolder",
        injections: ['FolderService','SubjectService', (FolderService, SubjectService) => {
            return {
                restrict: "E",
                scope : {
                    folder :"="
                },
                templateUrl: 'exercizer/public/app/templates/directives/dominoFolder.html',
                link:(scope : any, element, attrs) => {

                    scope.getFolderTitle =  function(){
                        return scope.folder.label;
                    };

                    scope.canManageFolder = function(){
                        return true;
                    };

                    scope.filterFolder = function(){
                        if(FolderService.currentFolderId){
                            return scope.folder.parent_folder_id == FolderService.currentFolderId;
                        } else{
                            return true;
                        }
                    }
                 }
            };
        }]
    }
);