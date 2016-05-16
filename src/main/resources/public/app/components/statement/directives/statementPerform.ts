/// <reference path="./../../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "statementPerform",
        injections: [ '$sce', 'SimpleAnswerService',($sce, SimpleAnswerService) => {
            return {
                restrict: "E",
                scope : {
                    grainCopy : "="
                },
                templateUrl: 'exercizer/public/app/components/statement/templates/perform.html',
                link:(scope : any, element, attrs) => {

                    scope.statementHtml = $sce.trustAsHtml(scope.grainCopy.grain_copy_data.custom_copy_data.statement);

                }
            };
        }]
    }
);

