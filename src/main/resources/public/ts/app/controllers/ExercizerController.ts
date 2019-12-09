import { ng, model, template, moment } from 'entcore';
import { IGrainCopy } from '../models/domain';
import http from 'axios';

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

    async function checkSystemDate():Promise<boolean> {
        //check system time of user
        let res:any = await http.get('/exercizer/now');
        let nowServer = await res.data.date;
        nowServer = moment(nowServer);
        nowServer.set({minute: 0, second: 0, millisecond: 0});
        let nowClient = moment();
        nowClient.set({minute: 0, second: 0, millisecond: 0});
        return (nowClient.isSame(nowServer)) ? true : false;
    }

    route({
        dashboard: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'teacher-dashboard-subject-tab');
                } else if (_userProfile === studentProfile) {
                    template.open('main', 'student-dashboard');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        dashboardStudent: async function () {
            if (await checkSystemDate()) {
                _userProfile = studentProfile;
                template.open('main', 'student-dashboard');
            } else {
                template.open('main', '400-date-exercizer');
            }
        
        },
        dashboardTeacherCorrection: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'teacher-dashboard-correction-tab');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        dashboardTeacherLibrary: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'teacher-dashboard-library-tab');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        editSubject: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'edit-subject');
                } else if (_userProfile === studentProfile) {
                    template.open('main', 'student-dashboard');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        printSubject: function () {
            $scope.isPrintPage = true;
            template.open('main', 'print-subject');
        },
        editSimpleSubject: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'edit-simple-subject');
                } else if (_userProfile === studentProfile) {
                    template.open('main', 'student-dashboard');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        previewPerformSubjectCopy: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'perform-subject-copy');
                } else if (_userProfile === studentProfile) {
                    template.open('main', 'student-dashboard');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        previewEditSubjectSimpleCopy: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'edit-simple-subject');
                } else if (_userProfile === studentProfile) {
                    template.open('main', 'student-dashboard');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        performSubjectCopy: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === studentProfile) {
                    template.open('main', 'perform-subject-copy');
                } else if (_userProfile === teacherProfile) {
                    template.open('main', 'perform-subject-copy');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        performSimpleSubjectCopy: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === studentProfile) {
                    template.open('main', 'perform-simple-subject-copy');
                } else if (_userProfile === teacherProfile) {
                    template.open('main', 'perform-simple-subject-copy');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        previewViewSubjectCopy: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'view-subject-copy');
                } else if (_userProfile === studentProfile) {
                    template.open('main', 'student-dashboard');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        viewSubjectCopyAsTeacher: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'view-subject-copy');
                } else if (_userProfile === studentProfile) {
                    template.open('main', 'student-dashboard');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        viewSubjectCopy: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === studentProfile) {
                    template.open('main', 'view-subject-copy');
                } else if (_userProfile === teacherProfile) {
                    //template.open('main', 'teacher-dashboard');
                    template.open('main', 'view-subject-copy');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        dashboardTeacherArchive: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'teacher-dashboard-archive');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
            }
        },
        dashboardTeacherArchiveCopy: async function () {
            if (await checkSystemDate()) {
                if (_userProfile === teacherProfile) {
                    template.open('main', 'archive-view-subject-copy');
                } else {
                    template.open('main', '401-exercizer');
                }
            } else {
                template.open('main', '400-date-exercizer');
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

