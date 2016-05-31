routes.define(function($routeProvider){
    $routeProvider
        .when('/dashboard', {
            action: 'dashboard'
        })
        .when('/subject/edit/:subjectId/', {
            action: 'editSubject'
        })
        .when('/subject/copy/perform/:subjectCopyId/', {
            action: 'performSubjectCopy'
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
    var _userProfile = teacherProfile; // FIXME model.me.profiles

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
        performSubjectCopy: function () {
            if (_userProfile === studentProfile) {
                template.open('main', 'perform-subject-copy');
            } else if (_userProfile === teacherProfile) {
                template.open('main', 'teacher-dashboard');
            } else {
                template.open('main', '401-exercizer');
            }
        },
        viewSubjectCopy: function () {
            if (_userProfile === teacherProfile || _userProfile === studentProfile) {
                template.open('main', 'view-subject');
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
         * Filter
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

        /**
         * Constants
         */
        // FIXME
        module.constant("serverUrl", "http://foo.com");

        /**
         * Subject edit events
         */

        // edit subject controller - received events
        module.constant('E_GRAIN_LIST_UPDATED', 'GRAIN_LIST_UPDATED_');
        module.constant('E_ADD_GRAIN', 'ADD_GRAIN_');
        module.constant('E_UPDATE_GRAIN', 'UPDATE_GRAIN_');
        module.constant('E_REMOVE_GRAIN', 'REMOVE_GRAIN_');
        module.constant('E_GRAIN_TOGGLED', 'GRAIN_TOGGLED_');
        module.constant('E_FOLD_GRAIN_LIST', 'FOLD_GRAIN_LIST_');
        module.constant('E_GRAIN_SELECTED', 'GRAIN_SELECTED_');
        module.constant('E_DUPLICATE_SELECTED_GRAIN_LIST', 'DUPLICATE_SELECTED_GRAIN_LIST_');
        module.constant('E_REMOVE_SELECTED_GRAIN_LIST', 'REMOVE_SELECTED_GRAIN_LIST_');
        module.constant('E_ADD_GRAIN_DOCUMENT', 'ADD_GRAIN_DOCUMENT_');
        module.constant('E_REMOVE_GRAIN_DOCUMENT', 'REMOVE_GRAIN_DOCUMENT_');
        module.constant('E_CONFIRM_REMOVE_GRAIN', 'CONFIRM_REMOVE_GRAIN_');
        module.constant('E_CONFIRM_REMOVE_SELECTED_GRAIN_LIST', 'CONFIRM_REMOVE_SELECTED_GRAIN_LIST_');
        module.constant('E_CONFIRM_ADD_GRAIN_DOCUMENT', 'CONFIRM_GRAIN_DOCUMENT_');
        module.constant('E_CONFIRM_REMOVE_GRAIN_DOCUMENT', 'CONFIRM_REMOVE_GRAIN_DOCUMENT_');
        module.constant('E_PREVIEW_PERFORM_SUBJECT_COPY', 'PREVIEW_PERFORM_SUBJECT_COPY_');
        // edit subject controller - broadcast events
        module.constant('E_REFRESH_GRAIN_LIST', 'REFRESH_GRAIN_LIST_');
        module.constant('E_TOGGLE_GRAIN', 'TOGGLE_GRAIN_');
        module.constant('E_FORCE_FOLDING_GRAIN', 'FORCE_FOLDING_GRAIN_');
        module.constant('E_SELECT_GRAIN', 'E_SELECT_GRAIN_');
        module.constant('E_TOGGLE_SUBJECT_EDIT_TOASTER', 'TOGGLE_SUBJECT_EDIT_TOASTER_');
        module.constant('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN', 'DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN_');
        module.constant('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_SELECTED_GRAIN_LIST', 'DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_SELECTED_GRAIN_LIST_');
        module.constant('E_DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT', 'DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT_');
        module.constant('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN_DOCUMENT', 'DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN_DOCUMENT');
        module.constant('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN_DOCUMENT', 'DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN_DOCUMENT_');
        module.constant('E_DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT_COPY', 'DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT_COPY_');

        /**
         * Subject copy perform events
         */

        // perform subject copy controller - received events
        module.constant('E_UPDATE_GRAIN_COPY', 'UPDATE_GRAIN_COPY_');
        module.constant('E_CURRENT_GRAIN_COPY_CHANGED', 'CURRENT_GRAIN_COPY_CHANGED_');
        // perform subject copy controller - broadcast events
        module.constant('E_CURRENT_GRAIN_COPY_CHANGE', 'CURRENT_GRAIN_COPY_CHANGER_');

        /**
         * Services
         */

        module.service('UserService', UserService);
        module.service('SubjectService', SubjectService);
        module.service('SubjectScheduledService', SubjectScheduledService);
        module.service('SubjectCopyService', SubjectCopyService);
        module.service('GrainService', GrainService);
        module.service('GrainScheduledService', GrainScheduledService);
        module.service('GrainCopyService', GrainCopyService);
        module.service('GrainTypeService', GrainTypeService);
        module.service('SimpleAnswerService', SimpleAnswerService);
        module.service('DragService', DragService );
        module.service('FolderService', FolderService );

        /**
         * Controllers
         */
        module.controller('TeacherDashboardController', TeacherDashboardController);
        module.controller('EditSubjectController', EditSubjectController);
        module.controller('PerformSubjectCopyController', PerformSubjectCopyController);

        /**
         * Directives
         */
        directives.forEach((item) => {
            module.directive(item.name, item.injections);
        });
    }
};

