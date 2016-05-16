directives.push(
    {
        name: 'lightboxPreviewCopyCorrection',
        injections: ['PreviewSubjectService','SubjectService','GrainService', (PreviewSubjectService, SubjectService, GrainService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxPreviewSubjectMarking.html',
                link:(scope : any, element, attrs) => {

                    scope.subjectCopy = function(){
                        return PreviewSubjectService.subjectCopy;
                    };

                    scope.subjectScheduled = function(){
                        return PreviewSubjectService.subjectScheduled;
                    };

                    scope.display = function(){
                        return PreviewSubjectService.displayPreviewCopyCorrect;
                    };

                    scope.hide = function(){
                        PreviewSubjectService.displayPreviewCopyCorrect = false;
                    }

                }
            };
        }]
    }
);
