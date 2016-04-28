routes.define(function($routeProvider){
    $routeProvider
        .when('/viewSubject', {
            action: 'viewSubject'
        })
        .when('/createSubject', {
            action: 'createSubject'
        })
        .otherwise({
            redirectTo: '/welcome'
        });
});


function ExercizerController($scope, $rootScope, model, template, route, date) {

    route({
        viewSubject: function(params){
            console.log('Route viewSubject');
        },
        createSubject: function(params){
            console.log('Route createSubject');

        }
    });



}
