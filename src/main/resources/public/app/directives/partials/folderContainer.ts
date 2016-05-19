directives.push(
    {
        name: 'folderContainer',
        injections: ['FolderService', (FolderService) => {
            return {
                restrict: 'E',
                replace  : true,
                scope: {
                    folderList: "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/partials/folderContainer.html',
                link: (scope:any, element, attrs) => {

                    scope.filterOnParentFolder = function(item)
                    {

                        if(!item.parent_folder_id)
                        {
                            return true; // this will be listed in the results
                        }

                        return false; // otherwise it won't be within the results
                    };

                }
            };
        }]
    }
);
