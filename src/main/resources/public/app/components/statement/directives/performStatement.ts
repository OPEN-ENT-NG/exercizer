/**
 * Created by Erwan_LP on 28/04/2016.
 */
/// <reference path="./../../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "performStatement",
        injections: [ '$sce', 'SimpleAnswerService',($sce, SimpleAnswerService) => {
            return {
                restrict: "E",
                scope : {
                    grain : "="
                },
                templateUrl: 'exercizer/public/app/components/statement/templates/perform.html',
                link:(scope : any, element, attrs) => {

                    scope.$watch('grain', function() {
                        scope.statementHtml = $sce.trustAsHtml(scope.grain.grain_data.custom_data.statement);
                    }, true);

                }
            };
        }]
    }
);

