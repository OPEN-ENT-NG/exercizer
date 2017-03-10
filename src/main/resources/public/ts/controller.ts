routes.define(function($routeProvider){
    $routeProvider
        .when('/dashboard', {
            action: 'dashboard'
        })
        .when('/dashboard/student', {
            action: 'dashboardStudent'
        })
        .when('/dashboard/teacher/correction/:subjectScheduledId?', {
            action: 'dashboardTeacherCorrection'
        })
        .when('/dashboard/teacher/library', {
            action: 'dashboardTeacherLibrary'
        })
        .when('/subject/edit/:subjectId/', {
            action: 'editSubject'
        })
        .when('/subject/edit/simple/:subjectId/', {
            action: 'editSimpleSubject'
        })
        .when('/subject/copy/preview/perform/:subjectId/', {
            action: 'previewPerformSubjectCopy'
        })
        // perform as student
        .when('/subject/copy/perform/:subjectCopyId/', {
            action: 'performSubjectCopy'
        })
        .when('/subject/copy/preview/perform/simple/:subjectId/', {
            action: 'previewPerformSubjectSimpleCopy'
        })
        .when('/subject/copy/perform/simple/:subjectCopyId/', {
            action: 'performSimpleSubjectCopy'
        })
        .when('/subject/copy/view/preview/:subjectId/', {
            action: 'previewViewSubjectCopy'
        })
        .when('/subject/copy/view/:subjectId/:subjectCopyId/', {
            action: 'viewSubjectCopyAsTeacher'
        })
        // view as student
        .when('/subject/copy/view/:subjectCopyId/', {
            action: 'viewSubjectCopy'
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
});

var directives = [];

function ExercizerController($scope, $rootScope, model, template, route, date, $route) {

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
                //TODO David student view
                //template.open('main', 'student-dashboard');
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
        previewPerformSubjectSimpleCopy: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'perform-simple-subject-copy');
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
}

(window as any).AngularExtensions = {
    init: function(module){

        module.config(['$httpProvider', function($httpProvider) {
            //initialize get if not there
            if (!$httpProvider.defaults.headers.get) {
                $httpProvider.defaults.headers.get = {};
            }

            // Answer edited to include suggestions from comments
            // because previous version of code introduced browser-related errors

            //disable IE ajax request caching
            $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
            // extra
            $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
            $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
        }]);


        /**
         * Filters
         */

        module.filter('orderObjectBy', function() {
            return function(items, field, reverse) {
                var filtered = [];
                angular.forEach(items, function(item) {
                    filtered.push(item);
                });
                filtered.sort(function (a, b) {
                    return (a[field] > b[field] ? 1 : -1);
                });
                if(reverse) filtered.reverse();
                return filtered;
            };
        });

        module.filter('filterIf', function() {
            return function(i,b) {
                if(b){
                    return i;
                }
            };
        });


        function floorFigure(figure : number, decimals : number){
            if (!decimals) decimals = 2;
            var d = Math.pow(10,decimals);
            return ((figure*d)/d).toFixed(decimals);
        }

        module.filter('truncateNumber', function () {
            return function (item) {
                if(!item){
                    // if item is not a number return an empty string
                    return ""
                } else {
                    if(parseFloat(item) == parseInt(item)){
                        return item;
                    }
                    return floorFigure(parseFloat(item), 2);
                }

            };
        });

        /**
         * Services
         */

        module.service('SubjectService', SubjectService);
        module.service('SubjectLibraryService', SubjectLibraryService);
        module.service('SubjectLessonTypeService', SubjectLessonTypeService);
        module.service('SubjectLessonLevelService', SubjectLessonLevelService);
        module.service('SubjectTagService', SubjectTagService);
        module.service('SubjectScheduledService', SubjectScheduledService);
        module.service('SubjectCopyService', SubjectCopyService);
        module.service('GrainService', GrainService);
        module.service('GrainScheduledService', GrainScheduledService);
        module.service('GrainCopyService', GrainCopyService);
        module.service('GrainTypeService', GrainTypeService);
        module.service('SimpleAnswerService', SimpleAnswerService);
        module.service('MultipleAnswerService', MultipleAnswerService);
        module.service('AssociationService', AssociationService);
        module.service('QcmService', QcmService);
        module.service('OpenAnswerService', OpenAnswerService);
        module.service('OrderService', OrderService);
        module.service('DragService', DragService );
        module.service('FolderService', FolderService );
        module.service('DateService', DateService );
        module.service('GroupService', GroupService );
        module.service('AccessService', AccessService );

        /**
         * Controllers
         */
        module.controller('TeacherDashboardSubjectTabController', TeacherDashboardSubjectTabController);
        module.controller('TeacherDashboardCorrectionTabController', TeacherDashboardCorrectionTabController);
        module.controller('TeacherDashboardLibraryTabController', TeacherDashboardLibraryTabController);
        module.controller('EditSubjectController', EditSubjectController);
        module.controller('EditSimpleSubjectController', EditSimpleSubjectController);
        module.controller('PerformSubjectCopyController', PerformSubjectCopyController);
        module.controller('ViewSubjectCopyController', ViewSubjectCopyController);
        module.controller('SubjectCopyListController', SubjectCopyListController);
        module.controller('PerformSimpleSubjectCopyController', PerformSimpleSubjectCopyController);

        /**
         * Directives
         */
        directives.forEach((item) => {
            module.directive(item.name, item.injections);
        });
    }
};

