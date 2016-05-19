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
                    link:(scope: any) => {

                        function _init() {
                            scope.isNewSubject = false;
                            scope.subject = SubjectService.getCurrentSubject();

                            if (!scope.subject || angular.isUndefined(scope.subject)) {
                                scope.subject = SubjectService.createObjectSubject();
                                scope.isNewSubject = true;
                            }
                        }

                        scope.saveSubjectProperties = function() {

                            if (!scope.subject.title || scope.subject.title.length === 0) {
                                notify.info('Veuillez renseigner un titre.');

                            } else {

                                if (scope.isNewSubject) {
                                    SubjectService.createSubject(
                                        scope.subject,
                                        function (data) {
                                            //TODO remove console log
                                            console.info(data);
                                            $location.path('/teacher/subject/edit')
                                        },
                                        function (err) {
                                            notify.error(err);
                                        }
                                    );

                                } else {

                                    SubjectService.updateSubject(
                                        scope.subject,
                                        function(data) {
                                            //TODO remove console log
                                            console.info(data);
                                            notify.info('Les propriétés du sujet ont été mises à jour.');
                                            scope.isDisplayed = false;
                                        },
                                        function(err) {
                                            notify.error(err);
                                        }
                                    )
                                }
                            }
                        };

                        scope.closeLightbox = function() {
                            scope.isDisplayed = false;
                        };
                        
                        scope.$watch('isDisplayed', function(isDisplayed: boolean) {
                            if (isDisplayed) {
                                _init();
                            } else {
                                scope.subject = SubjectService.createObjectSubject();
                            }
                        });
                    }
                };
            }]
    }
);
