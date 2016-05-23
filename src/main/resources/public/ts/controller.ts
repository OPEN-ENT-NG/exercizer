routes.define(function($routeProvider){
    $routeProvider
        .when('/teacher/home', {
            action: 'teacherHome'
        })
        .when('/teacher/subject/edit/:subjectId/', {
            action: 'teacherSubjectEdit'
        })
        .otherwise({
            redirectTo: '/teacher/home'
        });
});

var directives = [];
var controllers = [];
var services = [];

function ExercizerController($scope, $rootScope, model, template, route, date, $route){
    route({
        teacherHome: function(params){
            template.open('main', 'teacher-home');
        },
        teacherSubjectEdit: function(params){
            template.open('main', 'teacher-subject-edit');

        }
    });
    $route.reload()

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
         // TODO define url server
        module.constant("serverUrl", "http://foo.com");

        /**
         * Services
         */
        module.service('SubjectService', SubjectService);
        module.service('FolderService', FolderService);
        module.service('GrainService', GrainService);
        module.service('GrainTypeService', GrainTypeService);
        module.service('SimpleAnswerService', SimpleAnswerService);
        module.service('GrainCopyService', GrainCopyService);
        module.service('GrainScheduledService', GrainScheduledService);
        module.service('StatementService', StatementService);
        module.service('SelectedGrainService', SelectedGrainService);
        module.service('PreviewSubjectService', PreviewSubjectService);
        module.service('SubjectScheduledService', SubjectScheduledService );
        module.service('CopyService', CopyService );
        module.service('CompareStringService', CompareStringService );
        module.service('ToolsService', ToolsService );
        module.service('DragService', DragService );

        /**
         * Controllers
         */
        module.controller('TeacherHomeCtrl', TeacherHomeCtrl);
        module.controller('TeacherEditSubjectCtrl', TeacherEditSubjectCtrl);

        /**
         * Directives
         */
        directives.forEach((item) => {
            module.directive(item.name, item.injections);
        });

    }
};

