/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainAddDocument",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    grain : '=',
                    state: '@',
                },
                templateUrl: "exercizer/public/app/templates/directives/common_grain/grainAddDocument.html",
                link:(scope : any, element, attrs) => {

                    /**
                     * EVENTS
                     */

                    scope.showMediaLibrary =function(){
                        scope.display.mediaLibrary = true;
                    };

                    /**
                     * CALLBACK
                     */

                    scope.callbackMediaLibrary = function(mediaLibraryItem){
                        var document = {
                            id : mediaLibraryItem._id,
                            path :'/workspace/document/' + mediaLibraryItem._id,
                            created : mediaLibraryItem.created._i,
                            name : mediaLibraryItem.name,
                            title : mediaLibraryItem.title,
                            owner : mediaLibraryItem.owner,
                            ownerName : mediaLibraryItem.ownerName,

                        };
                        if(!scope.grain.grain_data.documentList){
                            scope.grain.grain_data.documentList = [];
                        }
                        scope.grain.grain_data.documentList.push(document);
                        scope.display.mediaLibrary = false;
                    };

                    /**
                     * DISPLAY
                     */

                    scope.display = {
                        mediaLibrary :false
                    };

                }
            };
        }]
    }
);