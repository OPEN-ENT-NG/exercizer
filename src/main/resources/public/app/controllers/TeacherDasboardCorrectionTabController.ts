class TeacherDashboardCorrectionTabController {

    public selectedSubjectScheduled;

    static $inject = [
        '$routeParams',
        '$scope',
        '$q',
        'SubjectScheduledService',
        'SubjectCopyService'
    ];


    constructor($routeParams, $scope, $q, SubjectScheduledService,SubjectCopyService) {
        $q.all([
                SubjectScheduledService.resolve(true),
                SubjectCopyService.resolve(true),
            ])
            .then(function() {
                if (angular.isUndefined($routeParams['subjectScheduledId'])) {
                    // display list of subject scheduled
                } else {
                    // display list of copy link to this subject scheduled
                    var subjectScheduled = SubjectScheduledService.getById($routeParams['subjectScheduledId']);
                    if (subjectScheduled) {
                        $scope.selectedSubjectScheduled = subjectScheduled;
                    } else {
                        throw "subject missing";
                    }
                }
            });

    }
}
