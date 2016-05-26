directives.push(
    {
        name: "toaster",
        injections: [ 'SelectionService','LightboxService','FolderService','SubjectService', (SelectionService,LightboxService, FolderService, SubjectService) => {
            return {
                restrict: "E",
                scope : {
                  itemSelected : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/widget/toaster.html',
                link:(scope : any, element, attrs) => {

                    var listToasterItem = [
                        {
                            publicName : "Propriétes",
                            actionOnClick : function(){
                                if(SelectionService.itemSelected.folderList.length == 1){
                                    // folder is selected
                                    var folder = FolderService.folderById(SelectionService.itemSelected.folderList[0]);
                                    LightboxService.showLightboxEditFolderForEditFolder(folder);
                                }
                                if(SelectionService.itemSelected.subjectList.length == 1){
                                    // subject is selected
                                }
                            },
                            display : function(){
                                return SelectionService.itemSelected.folderList.length + SelectionService.itemSelected.subjectList.length == 1;
                            }
                        },
                        {
                            publicName : "Partager",
                            actionOnClick : function(){
                                console.log('Not implemented')
                            },
                            display : function(){
                                return false;
                            }
                        },
                        {
                            publicName : "Programmer",
                            actionOnClick : function(){
                                var subject = SubjectService.subjectById(SelectionService.itemSelected.subjectList[0]);
                                LightboxService.showLightboxScheduleSubject(subject);
                            },
                            display : function(){
                                return SelectionService.itemSelected.subjectList.length == 1 && SelectionService.itemSelected.folderList.length == 0
                            }
                        },
                        {
                            publicName : "Publier dans la bibliothèque",
                            actionOnClick : function(){
                                console.log('Not implemented')
                            },
                            display : function(){
                                return false;
                            }
                        },
                        {
                            publicName : "Copier",
                            actionOnClick : function(){
                                console.log('Not implemented')
                            },
                            display : function(){
                                return false;
                            }
                        },
                        {
                            publicName : "Supprimer",
                            actionOnClick : function(){
                                LightboxService.showLightboxDeleteSelection(SelectionService.itemSelected);
                            },
                            display : function(){
                                return true;
                            }
                        }
                    ];

                    scope.itemList = listToasterItem;

                    scope.isHide = function(){
                        if(SelectionService.itemSelected.folderList.length + SelectionService.itemSelected.subjectList.length == 0){
                            return true;
                        } else{
                            return false;
                        }
                    };

                }
            };
        }]
    }
);
