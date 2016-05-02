routes.define(function($routeProvider){
    $routeProvider
        .when('/teacher/home', {
            action: 'teacherHome'
        })
        .when('/teacher/subject/create', {
            action: 'teacherSubjectCreate'
        })
        .when('/teacher/subject/edit', {
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
        teacherSubjectCreate: function(params){
            template.open('main', 'teacher-subject-create');

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
         * Constants
         */
         // TODO define url server
        module.constant("serverUrl", "http://foo.com");

        /**
         * Directives
         */
        directives.forEach((item) => {
            module.directive(item.name, item.injections);
        });

        /**
         * Controllers
         */
        controllers.forEach((item) => {
            module.controller(item.name, item.injections);
        });

        /**
         * Services
         */
        services.forEach((item) => {
            module.service(item.name, item.injections);
        });

        // TODO clean
        module.controller('TeacherHomeCtrl', TeacherHomeCtrl);
        module.controller('TeacherCreateSubjectCtrl', TeacherCreateSubjectCtrl);
        module.service('SubjectService', SubjectService);
        module.directive("editStatement", editStatement);
        module.directive("editQuestionTitle", editQuestionTitle);
        module.directive("editQuestionStatement", editQuestionStatement);
        module.directive("editQuestionMaxScore", editQuestionMaxScore);
        module.directive("editQuestionAddDocument", editQuestionAddDocument);
        module.directive("editQuestionHint", editQuestionHint);
        module.directive("editQuestionCorrection", editQuestionCorrection);
        module.directive("addOnElement", addOnElement);
        module.directive("exercizerHelp", exercizerHelp);
        module.directive("exercizerFold", exercizerFold);

    }
};

