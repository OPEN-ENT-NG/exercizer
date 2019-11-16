import { ng, model, template } from 'entcore';
import { IGrainCopy } from '../models/domain';

export const exercizerController = ng.controller('ExercizerController', ['$scope', '$rootScope', 'model', 'route', '$route', '$location',
    ($scope, $rootScope, model, route, $route, $location) => {

    const teacherProfile = 'Teacher';
    const studentProfile = 'Student';
    const canAccessTeacherProfile = model.me.workflow.exercizer.create || false;

    var _userProfile;

    if (canAccessTeacherProfile){
        _userProfile = teacherProfile;
    } else {
        _userProfile = studentProfile;
    }

    route({
        dashboard: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'teacher-dashboard-subject-tab');
            } else if (_userProfile === studentProfile) {
                template.open('main', 'student-dashboard');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        dashboardStudent: function () {
            _userProfile = studentProfile;
            template.open('main', 'student-dashboard');
        },
        dashboardTeacherCorrection: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'teacher-dashboard-correction-tab');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        dashboardTeacherLibrary: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'teacher-dashboard-library-tab');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        editSubject: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'edit-subject');
            } else if (_userProfile === studentProfile) {
                template.open('main', 'student-dashboard');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        printSubject: function () {
            $scope.isPrintPage = true;
            template.open('main', 'print-subject');
        },
        editSimpleSubject: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'edit-simple-subject');
            } else if (_userProfile === studentProfile) {
                template.open('main', 'student-dashboard');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        previewPerformSubjectCopy: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'perform-subject-copy');
            } else if (_userProfile === studentProfile) {
                template.open('main', 'student-dashboard');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        previewEditSubjectSimpleCopy: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'edit-simple-subject');
            } else if (_userProfile === studentProfile) {
                template.open('main', 'student-dashboard');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        performSubjectCopy: function () {
            if (_userProfile === studentProfile) {
                template.open('main', 'perform-subject-copy');
            } else if (_userProfile === teacherProfile) {
                template.open('main', 'perform-subject-copy');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        performSimpleSubjectCopy: function () {
            if (_userProfile === studentProfile) {
                template.open('main', 'perform-simple-subject-copy');
            } else if (_userProfile === teacherProfile) {
                template.open('main', 'perform-simple-subject-copy');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        previewViewSubjectCopy: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'view-subject-copy');
            } else if (_userProfile === studentProfile) {
                template.open('main', 'student-dashboard');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        viewSubjectCopyAsTeacher: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'view-subject-copy');
            } else if (_userProfile === studentProfile) {
                template.open('main', 'student-dashboard');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        viewSubjectCopy: function () {
            if (_userProfile === studentProfile) {
                template.open('main', 'view-subject-copy');
            } else if (_userProfile === teacherProfile) {
                //template.open('main', 'teacher-dashboard');
                template.open('main', 'view-subject-copy');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        dashboardTeacherArchive: function () {
            if(_userProfile === teacherProfile){
                template.open('main', 'teacher-dashboard-archive');
            }else {
                template.open('main', '401-exercizer');
            }
        },
        dashboardTeacherArchiveCopy: function () {
            if(_userProfile === teacherProfile){
                template.open('main', 'archive-view-subject-copy');
            }else {
                template.open('main', '401-exercizer');
            }
        },
    });

    // Used by mobile left nav

    $scope.redirectToDashBoard = function() {
        $location.path('/dashboard');
    };
    $scope.$on('E_GRAIN_COPY_LIST', function($event, _grainCopyList: IGrainCopy[]) {
        $scope.grainCopyList = _grainCopyList;
    });
    $scope.$on('E_CURRENT_GRAIN_COPY_CHANGE' , function(event, _grainCopy:IGrainCopy) {
        $scope.currentGrainCopy = _grainCopy;
    });
    $scope.mobileLeftNavChange = function(_grainCopy: IGrainCopy) {
        $scope.$broadcast('E_CURRENT_GRAIN_COPY_CHANGED', _grainCopy, $scope.grainCopyList);
    }


    $route.reload();
}]);

