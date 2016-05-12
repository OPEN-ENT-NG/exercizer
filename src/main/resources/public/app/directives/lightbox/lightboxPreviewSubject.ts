directives.push(
    {
        name: 'lightboxPreviewSubject',
        injections: ['PreviewSubjectService','SubjectService','GrainService', (PreviewSubjectService, SubjectService, GrainService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxPreviewSubject.html',
                link:(scope : any, element, attrs) => {

                    scope.subjectCopy = function(){
                        return PreviewSubjectService.subjectCopy;
                    };

                    scope.subjectScheduled = function(){
                        return PreviewSubjectService.subjectScheduled;
                    };

                    scope.display = function(){
                        return PreviewSubjectService.displayPreviewSubject;
                    };

                    scope.hide = function(){
                        PreviewSubjectService.displayPreviewSubject = false;
                    }

                }
            };
        }]
    }
);
