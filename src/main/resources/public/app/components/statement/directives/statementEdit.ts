/// <reference path="./../../../typings/angular-1.2.d.ts"/>
directives.push(
    {
        name: "statementEdit",
        injections: [ 'GrainService', 'StatementService',(GrainService, StatementService) => {
            return {
                restrict: "E",
                scope : {
                    grain : "=",
                    updateGrain : "&"

                },
                templateUrl: 'exercizer/public/app/components/statement/templates/statementEdit.html',
                link:(scope : any, element, attrs) => {

                    function init(){
                        if(scope.grain.grain_data.custom_data == null){
                            scope.grain.grain_data.custom_data = StatementService.createObjectCustomData();
                        }
                    }
                    init();

                    var isFocus;

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
                            scope.updateGrain();
                            isFocus = false;
                        }
                    });
                }
            };
        }]
    }
);


