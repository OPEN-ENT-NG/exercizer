directives.push(
    {
        name: 'lightboxDeleteSelection',
        injections: ['LightboxService', 'FolderService', 'SubjectService','SelectionService','$rootScope',  (LightboxService, FolderService, SubjectService, SelectionService, $rootScope) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxDeleteSelection.html',
                link: (scope:any, element, attrs) => {

                    scope.list = null;

                    scope.isDisplayed = function () {
                        if (LightboxService.lightboxDeleteSelection.display) {
                            if (scope.list == null) {
                                scope.list = LightboxService.lightboxDeleteSelection.list;
                            }
                            return true;
                        } else {
                            return false;
                        }
                    };
                    scope.deleteSelection = function () {
                        // delete folder
                        angular.forEach(scope.list.folderList, function(id, key) {
                            FolderService.deleteFolder(FolderService.folderById(id), function(data) {
                                // data is folder
                                SelectionService.toggleFolder(id, false);
                            }, null)
                        });
                        // delete subject
                        angular.forEach(scope.list.subjectList, function(id, key) {
                            //TODO delete subject;
                        });

                        scope.hide();
                    };

                    scope.hide = function () {
                        LightboxService.hideLightboxDeleteSelection();
                        scope.list = null;
                    };

                    scope.getFolderLabelById = function(id){
                        var folder = FolderService.folderById(id);
                        return folder? folder.label : null;
                    };

                    scope.getSubjectTitleById = function(id){
                        var subject = SubjectService.subjectById(id);
                        return subject ? subject.title : null;
                    }
                }
            };
        }]
    }
);
