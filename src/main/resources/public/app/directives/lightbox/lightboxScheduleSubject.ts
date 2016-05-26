directives.push(
    {
        name: 'lightboxScheduleSubject',
        injections: ['LightboxService','FolderService', (LightboxService, FolderService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxScheduleSubject.html',
                link:(scope : any, element, attrs) => {

                    scope.subject = null;
                    scope.isDisplayed = function(){
                        if(LightboxService.lightboxScheduleSubject.display){
                            if(scope.subject == null){
                                scope.subject = LightboxService.lightboxScheduleSubject.subject;
                            }
                            return true;
                        } else{
                            return false;
                        }
                    };

                    scope.save = function () {
                        console.log('TODO');
                    };

                    scope.hide = function () {
                        LightboxService.hideLightboxScheduleSubject();
                        scope.subject = null;
                    };

                }
            };
        }]
    }
);
