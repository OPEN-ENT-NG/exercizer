/// <reference path="./typings/angular-1.2.d.ts"/>

var exercizerApp = angular.module('exercizerApp');

exercizerApp
    .config(function ($stateProvider, $urlRouterProvider, $state) {

        $stateProvider
            .state('test', {
                url: '/test',
                templateUrl: 'templates/index.html',
                controller: 'TestController'
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/test');
    })

    .run(function() {

    });