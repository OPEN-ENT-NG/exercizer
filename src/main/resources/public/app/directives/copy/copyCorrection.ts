directives.push(
    {
        name: "copyCorrection",
        injections: ['SubjectService', 'GrainCopyService', 'GrainScheduledService','PreviewSubjectService', (SubjectService, GrainCopyService,GrainScheduledService, PreviewSubjectService) => {
            return {
                restrict: "E",
                scope: {
                    subjectCopy: "=",
                    subjectScheduled: "=",
                },
                templateUrl: 'exercizer/public/app/templates/directives/copy/copyCorrection.html',
                link: (scope:any, element, attrs) => {

                    var _cacheGrainCopyList = null;
                    var _cacheGrainScheduledList = null;


                    scope.grainCopyList = function () {
                        if (_cacheGrainCopyList) {
                            // data here
                        } else {
                            if (scope.subjectCopy) {
                                _cacheGrainCopyList = GrainCopyService.grainCopyListBySubjectCopyId(scope.subjectCopy.id);
                            }
                        }
                        return _cacheGrainCopyList;
                    };

                    scope.grainScheduledList = function () {
                        if (_cacheGrainScheduledList) {
                            // data here
                        } else {
                            if (scope.subjectScheduled) {
                                _cacheGrainScheduledList = GrainScheduledService.grainScheduledListBySubjectScheduledId(scope.subjectScheduled.id);
                            }
                        }
                        return _cacheGrainScheduledList;
                    };
                }
            };
        }]
    }
);

