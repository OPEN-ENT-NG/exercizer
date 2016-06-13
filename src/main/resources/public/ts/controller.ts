routes.define(function($routeProvider){
    $routeProvider
        .when('/dashboard', {
            action: 'dashboard'
        })
        .when('/subject/edit/:subjectId/', {
            action: 'editSubject'
        })
        .when('/subject/copy/preview/perform/:subjectId/', {
            action: 'previewPerformSubjectCopy'
        })
        .when('/subject/copy/perform/:subjectCopyId/', {
            action: 'performSubjectCopy'
        })
        .when('/subject/copy/view/preview/:subjectId/', {
            action: 'previewViewSubjectCopy'
        })
        .when('/subject/copy/view/:subjectId/:subjectCopyId/', {
            action: 'viewSubjectCopyAsTeacher'
        })
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
    var _userProfile;
    if(model.me.type === 'ENSEIGNANT'){
        _userProfile = teacherProfile;
    } else  {
        _userProfile = studentProfile;
    }

    route({
        dashboard: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'teacher-dashboard');
            } else if (_userProfile === studentProfile) {
                template.open('main', 'student-dashboard');
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
        previewPerformSubjectCopy: function () {
            if (_userProfile === teacherProfile) {
                template.open('main', 'perform-subject-copy');
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
                template.open('main', 'teacher-dashboard');
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
                template.open('main', 'perform-subject-copy');
            } else if (_userProfile === teacherProfile) {
                template.open('main', 'teacher-dashboard');
            } else {
                template.open('main', '401-exercizer');
            }
        }
    });

    $route.reload();
}

(window as any).AngularExtensions = {
    init: function(module){

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

        /**
         * Constants
         */
        // TODO remove
        module.constant("serverUrl", "http://foo.com");

        /**
         * Services
         */

        module.service('SubjectService', SubjectService);
        module.service('SubjectScheduledService', SubjectScheduledService);
        module.service('SubjectCopyService', SubjectCopyService);
        module.service('GrainService', GrainService);
        module.service('GrainScheduledService', GrainScheduledService);
        module.service('GrainCopyService', GrainCopyService);
        module.service('GrainTypeService', GrainTypeService);
        module.service('SimpleAnswerService', SimpleAnswerService);
        module.service('MultipleAnswerService', MultipleAnswerService);
        module.service('QcmService', QcmService);
        module.service('OpenAnswerService', OpenAnswerService);
        module.service('OrderService', OrderService);
        module.service('DragService', DragService );
        module.service('FolderService', FolderService );
        module.service('DateService', DateService );
        module.service('GroupService', GroupService );

        /**
         * Controllers
         */
        module.controller('TeacherDashboardController', TeacherDashboardController);
        module.controller('TeacherDashboardSubjectTabController', TeacherDashboardSubjectTabController);
        module.controller('EditSubjectController', EditSubjectController);
        module.controller('PerformSubjectCopyController', PerformSubjectCopyController);
        module.controller('ViewSubjectCopyController', ViewSubjectCopyController);

        /**
         * Directives
         */
        directives.forEach((item) => {
            module.directive(item.name, item.injections);
        });
    }
};

