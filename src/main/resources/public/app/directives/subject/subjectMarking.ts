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
                templateUrl: 'exercizer/public/app/templates/directives/subject/subjectMarking.html',
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

                    scope.getGrainScheduledLinkToThisGrainCopy = function(grain_copy){
                        var grain_scheduled_list = scope.grainScheduledList();
                        return grain_scheduled_list[grain_copy.grain_scheduled_id];
                    };

                    scope.grainScheduledList = function () {
                        return  GrainScheduledService.grainScheduledListBySubjectScheduledId(scope.subjectScheduled.id);
                    };
                }
            };
        }]
    }
);

