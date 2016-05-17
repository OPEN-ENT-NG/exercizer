/// <reference path="./../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "grainStatement",
        injections: [ '$sce',($sce) => {
            return {
                restrict: "E",
                scope: {
                    statement: '=',
                    grainState: '@',
                    onBlurFunction : "&"
                },
                templateUrl: "exercizer/public/app/templates/directives/common_grain/grainStatement.html",
                link:(scope : any, element, attrs) => {

                    var isFocus;

                    scope.statementHtml = $sce.trustAsHtml(scope.statement);


                    /**
                     * Event JQuery because no ng-blur on editor
                     */
                    element.find('editor').on('editor-focus', function(){
                        isFocus = true;
                    });
                    /**
                     * Event JQuery because no ng-blur on editor
                     */
                    element.find('editor').on('editor-blur', function(){
                        if(isFocus){
                            scope.onBlurFunction();
                            isFocus = false;
                        }
                    });

                }
            };
        }]
    }
);