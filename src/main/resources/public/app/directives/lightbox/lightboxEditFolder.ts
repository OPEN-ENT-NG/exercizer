directives.push(
    {
        name: 'lightboxEditFolder',
        injections: ['LightboxService','FolderService','SelectionService', (LightboxService, FolderService, SelectionService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxEditFolder.html',
                link:(scope : any, element, attrs) => {

                    scope.folder = null;
                    scope.isDisplayed = function(){
                        if(LightboxService.lightboxEditFolder.display){
                            if(scope.folder == null){
                                scope.folder = angular.copy(LightboxService.lightboxEditFolder.folder);
                                scope.state = LightboxService.lightboxEditFolder.state;

                            }
                            return true;
                        } else{
                            return false;
                        }
                    };

                    scope.save = function () {
                        if(scope.state == 'create'){
                            FolderService.createFolder(scope.folder, null, null);
                        } else if (scope.state == 'edit'){
                            FolderService.updateFolder(scope.folder,
                                function(data){
                                    SelectionService.toggleFolder(scope.folder.id, false);
                                }
                                , null);
                        }
                        scope.hide();
                    };

                    scope.hide = function () {
                        LightboxService.hideLightboxEditFolder();
                        scope.folder = null;
                    };

                }
            };
        }]
    }
);
