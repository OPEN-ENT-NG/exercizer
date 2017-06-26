import { ng, template } from 'entcore';

export const exercizerController = ng.controller('ExercizerController', ['$scope', '$rootScope', 'model', 'route', '$route'
    ,($scope, $rootScope, model, route, $route) => {

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
        }
    });

    $route.reload();
}]);

