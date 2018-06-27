import { ng } from 'entcore';

class TeacherDashboardArchiveController {

    private _$location;
    private _$scope;

    static $inject = [
        '$location',
        '$routeParams',
        '$scope',
        'ArchivesService'
    ];

    constructor($location, $routeParams, $scope, ArchivesService) {
        this._$location = $location;
        this._$scope = $scope;
        ArchivesService.resolveArchivedSubjectScheduled().then(function () {
            $scope.subjectScheduledList = ArchivesService.getListArchivedSubjectScheduled();
            ArchivesService.resolveArchivedSubjectScheduledCopy();
            if (angular.isUndefined($routeParams['subjectScheduledId'])) {
                $scope.selectedSubjectScheduled = undefined;
            } else {
                // display list of copy link to this subject scheduled
                var subjectScheduled = ArchivesService.getSubjectScheduledById($routeParams['subjectScheduledId']);
                if (subjectScheduled) {
                    $scope.selectedSubjectScheduled = subjectScheduled;
                } else {
                    throw "subject missing";
                }
            }
        });


        $scope.$on("E_EXPORT_STATS", function(event, data) {
            $scope.$broadcast('EXPORT_STATS', data);
        });
    }

    public clickReturnExercizer(){
        this._$location.path('/dashboard');
    }

    public clickReturnArchive(){
        this._$scope.selectedSubjectScheduled = undefined;
        this._$location.path('/dashboard/teacher/archive');
    }

    public getSubjectSelectedTitle = function() {
        if (this._$scope.selectedSubjectScheduled) {
            return this._$scope.selectedSubjectScheduled.title
        }
    }
}

export const teacherDashboardArchiveController = ng.controller('TeacherDashboardArchiveController', TeacherDashboardArchiveController);