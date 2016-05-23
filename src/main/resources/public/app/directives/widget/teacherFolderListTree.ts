directives.push(
    {
        name: 'teacherFolderListTree',
        injections: ['FolderService', (FolderService) => {
            return {
                restrict: 'E',
                templateUrl: 'exercizer/public/app/templates/directives/widget/teacherFolderListTree.html',
                link: (scope:any, element, attrs) => {

                    /**
                     * INIT
                     */

                    scope.folderList =  FolderService.folderList;

                    function reset() {
                        resetNewFolder();
                    }

                    reset();

                    /**
                     * TOGGLE DISPLAY
                     */

                    scope.toggleDisplayMySubjectList = function () {
                        scope.display.mySubjectList = !scope.display.mySubjectList;
                    };

                    scope.toggleDisplaySubjectListShareWithMe = function () {
                        scope.display.subjectListShareWithMe = !scope.display.subjectListShareWithMe;
                    };

                    /**
                     * EVENT
                     */

                    scope.clickCreateFolder = function () {
                        scope.display.lightboxCreateFolder = true;
                        resetNewFolder()
                    };

                    scope.hideLightbox = function () {
                        scope.display.lightboxCreateFolder = false;
                        resetNewFolder();
                    };

                    scope.goToRoot = function(){
                      FolderService.currentFolderId = null;
                    };

                    /**
                     * NEW FOLDER
                     */

                    scope.createNewFolder = function () {
                        FolderService.createFolder(scope.newFolder, null, null);
                        scope.hideLightbox();
                    };

                    function resetNewFolder() {
                        scope.newFolder = FolderService.createObjectFolder();
                    }

                    /**
                     * DISPLAY
                     */

                    scope.display = {
                        mySubjectList: false,
                        subjectListShareWithMe: false,
                        lightboxCreateFolder: false
                    };
                }
            };
        }]
    }
);
