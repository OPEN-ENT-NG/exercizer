directives.push(
    {
        name: "dominoSubject",
        injections: ['$location','FolderService','DragService', ($location, FolderService, DragService) => {
            return {
                restrict: "E",
                scope : {
                    subject : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/dominoSubject.html',
                link:(scope : any, element, attrs) => {

                    var defaultPicture = "/assets/themes/leo/img/illustrations/poll-default.png";
                    var defaultTitle = "Title";

                    scope.currentFolderId = FolderService.currentFolderId;


                    scope.getSubjectPicture = function(){
                        return scope.subject.picture || defaultPicture;
                    };

                    scope.getSubjectTitle =  function(){
                        return scope.subject.title || defaultTitle;
                    };

                    scope.getSubjectModificationDate = function(){

                        return scope.subject.modified ? "Modifié le "+scope.subject.modified : ""
                    };

                    scope.canManageSubject = function(){
                        return true;
                    };

                    scope.clickOnSubjectTitle = function(){
                        if(scope.subject.id){
                            $location.path('/teacher/subject/edit/'+scope.subject.id);
                        }
                    };

                    scope.filterFolder = function(){
                        if(FolderService.currentFolderId){
                            return scope.subject.folder_id == FolderService.currentFolderId;
                        } else{
                            return scope.subject.folder_id == null;
                        }
                    };


                    /**
                     * DRAG
                     */

                    scope.drag = function (item, $originalEvent) {
                        DragService.drag(item, $originalEvent);
                    };

                    scope.dragCondition = function (item) {
                        return DragService.canDragSubjectInPage(item);
                    };

                    scope.dropTo = function (targetItem, $originalEvent) {
                        DragService.dropTo(targetItem, $originalEvent, scope);
                    };

                    scope.dropCondition = function (targetItem) {
                        return DragService.canDropOnSubjectInPage(targetItem);
                    };

                }
            };
        }]
    }
);