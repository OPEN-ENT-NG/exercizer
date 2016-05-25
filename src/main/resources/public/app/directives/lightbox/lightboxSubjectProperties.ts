directives.push(
    {
        name: 'lightboxSubjectProperties',
        injections: [
            '$location',
            'SubjectService',
            ($location, SubjectService: ISubjectService) => {
                return {
                    restrict: 'E',
                    scope: {
                        isDisplayed: '='
                    },
                    templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxSubjectProperties.html',
                    link:(scope:any) => {

                        function _init() {

                            var _currentSubjectId = SubjectService.currentSubjectId;

                            if (!angular.isUndefined(_currentSubjectId)) {
                                scope.isNewSubject = false;
                                scope.subject = SubjectService.getById(_currentSubjectId);
                            } else {
                                scope.isNewSubject = true;
                                scope.subject = new Subject();
                            }
                        }

                        scope.saveSubjectProperties = function() {

                            if (!scope.subject.title || scope.subject.title.length === 0) {
                                notify.error('Veuillez renseigner un titre.');

                            } else {

                                if (scope.isNewSubject) {
                                    SubjectService.create(scope.subject).then(function(subject) {
                                        SubjectService.currentSubjectId = subject.id;
                                        $location.path('/teacher/subject/edit/' + subject.id);
                                    }, function(err) {
                                        notify.error(err);
                                    });

                                } else {
                                    SubjectService.update(scope.subject).then(function() {
                                        SubjectService.currentSubjectId = undefined;
                                        scope.isDisplayed = false;
                                    }, function(err) {
                                        notify.error(err);
                                    });
                                }
                            }
                        };

                        scope.closeLightbox = function() {
                            scope.isDisplayed = false;
                        };
                        
                        scope.$watch('isDisplayed', function(isDisplayed:boolean) {
                            if (isDisplayed) {
                                _init();
                            }
                        });
                    }
                };
            }]
    }
);
