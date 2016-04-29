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
         * Controllers
         */

        module.controller('TeacherHomeCtrl', TeacherHomeCtrl);
        module.controller('TeacherCreateSubjectCtrl', TeacherCreateSubjectCtrl);


        /**
         * Directives
         */
        module.directive("editOpenQuestion", editOpenQuestion);
        module.directive("editQuestionTitle", editQuestionTitle);
        module.directive("editQuestionMaxScore", editQuestionMaxScore);
        module.directive("editQuestionAddDocument", editQuestionAddDocument);
        module.directive("editQuestionHint", editQuestionHint);
        module.directive("editQuestionCorrection", editQuestionCorrection);
        module.directive("exercizerHelp", exercizerHelp);
    }
};

