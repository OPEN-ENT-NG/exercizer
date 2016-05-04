/**
 * Created by Erwan_LP on 03/05/2016.
 */
directives.push(
    {
        name: "exerciseListTeacherEdit",
        injections: ['GrainCreationService', (GrainCreationService) => {
            return {
                restrict: "E",
                scope : {
                  item : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/exercise_list/teacherEdit.html',
                link:(scope : any, element, attrs) => {

                }
            };
        }]
    }
);