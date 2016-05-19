directives.push(
    {
        name: "dominoSubject",
        injections: ['$location','SubjectService', ($location, SubjectService) => {
            return {
                restrict: "E",
                scope : {
                    subject : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/dominoSubject.html',
                link:(scope : any, element, attrs) => {

                    var defaultPicture = "/assets/themes/leo/img/illustrations/poll-default.png";
                    var defaultTitle = "Title";

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
                    }

                }
            };
        }]
    }
);