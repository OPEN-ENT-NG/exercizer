directives.push(
    {
        name: 'lightboxPreviewSubjectPerform',
        injections: ['PreviewSubjectService','SubjectService','GrainService', (PreviewSubjectService, SubjectService, GrainService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxPreviewSubjectPerform.html',
                link:(scope : any, element, attrs) => {

                    scope.subjectCopy = function(){
                        return PreviewSubjectService.subjectCopy;
                    };

                    scope.subjectScheduled = function(){
                        return PreviewSubjectService.subjectScheduled;
                    };

                    scope.display = function(){
                        return PreviewSubjectService.displayPreviewSubjectPerform;
                    };

                    scope.hide = function(){
                        PreviewSubjectService.displayPreviewSubjectPerform = false;
                    }

                }
            };
        }]
    }
);
