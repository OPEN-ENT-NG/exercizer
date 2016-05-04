/**
 * Created by Erwan_LP on 28/04/2016.
 */
/// <reference path="./../../../typings/angular-1.2.d.ts"/>

directives.push(
    {
        name: "editOpenQuestion",
        injections: [ () => {
            return {
                restrict: "E",
                templateUrl: 'exercizer/public/app/components/open_question/templates/edit.html',
                link:(scope : any, element, attrs) => {
                }
            };
        }]
    }
);






