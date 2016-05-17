directives.push(
    {
        name: 'lightboxCreateSubject',
        injections: [() => {
            return {
                restrict: 'E',
                scope: {
                    isDisplay :"="
                },
                templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxCreateSubject.html',
                link:(scope : any, element, attrs) => {


                    scope.display = function(){
                        return scope.isDisplay || false;
                    };

                    scope.hide = function(){
                        scope.isDisplay = false;
                    }
                }
            };
        }]
    }
);
