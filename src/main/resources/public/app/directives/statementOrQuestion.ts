/**
 * Created by Erwan_LP on 29/04/2016.
 */
directives.push(
    {
        name: "statementOrQuestion",
        injections: [ () => {
            return {
                restrict: "E",
                scope: {
                    item: '=item'
                },
                templateUrl: 'exercizer/public/app/templates/directives/statementOrQuestion.html',
                link:(scope : any, element, attrs) => {
                    scope.clickStatement = function(){
                        scope.item.typeCreation = "statement";
                    };
                    scope.clickQuestion = function(){
                        scope.item.typeCreation = "newQuestion";
                    };
                }
            };
        }]
    }
);