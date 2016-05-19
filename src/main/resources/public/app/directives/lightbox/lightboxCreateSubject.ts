directives.push(
    {
        name: 'lightboxCreateSubject',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    isDisplayed :"="
                },
                templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxCreateSubject.html',
                link:(scope : any, element, attrs) => {


                    scope.display = function(){
                        return scope.isDisplayed || false;
                    };

                    scope.hide = function(){
                        scope.isDisplayed = false;
                    }
                }
            };
        }]
    }
);
