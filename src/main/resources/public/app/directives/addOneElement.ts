/**
 * Created by Erwan_LP on 29/04/2016.
 */
directives.push(
    {
        name: "addOneElement",
        injections: [ () => {
            return {
                restrict: "E",
                templateUrl: 'exercizer/public/app/templates/directives/addOneElement.html',
                link:(scope : any, element, attrs) => {
                }
            };
        }]
    }
);