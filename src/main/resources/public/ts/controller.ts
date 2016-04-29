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
            template.open('main', 'teacher-create');

        },
        teacherSubjectEdit: function(params){
            template.open('main', 'teacher-edit');

        }
    });
    $route.reload()

}

(window as any).AngularExtensions = {
    init: function(module){
        /**
         * Directives
         */
        
        // SHARED
        module.directive("editQuestionTitle", editQuestionTitle);
        module.directive("editQuestionMaxScore", editQuestionMaxScore);
        module.directive('editQuestionStatement', editQuestionStatement);
        module.directive("editQuestionAddDocument", editQuestionAddDocument);
        module.directive("editQuestionHint", editQuestionHint);
        module.directive("editQuestionCorrection", editQuestionCorrection);
        module.directive("exercizerHelp", exercizerHelp);
        module.directive("subjectOrganizer", subjectOrganizer);
        module.directive("subjectsTree", subjectsTree);
        
        // COMPONENT SAMPLE
        module.directive('editSample', editSample);
        
        // COMPONENTS
        module.directive("editOpenQuestion", editOpenQuestion);

        /**
         * Controllers
         */
        module.controller('TeacherHomeCtrl', TeacherHomeCtrl);
    }
};

