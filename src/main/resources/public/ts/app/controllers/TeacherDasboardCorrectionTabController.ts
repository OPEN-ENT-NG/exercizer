import { ng } from 'entcore';
import { angular } from 'entcore';

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
                SubjectCopyService.resolve_force(true),
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

        $scope.$on('E_SEE_SUBJECT_SCHEDULED_ASSIGN_AT', function(event, data) {
            $scope.$broadcast('SEE_SUBJECT_SCHEDULED_ASSIGN_AT', data);
        });

        $scope.$on("E_EXPORT_STATS", function(event, data) {
            $scope.$broadcast('EXPORT_STATS', data);
        });


    }
}

export const teacherDashboardCorrectionTabController = ng.controller('TeacherDashboardCorrectionTabController', TeacherDashboardCorrectionTabController);