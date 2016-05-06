/**
 * Created by Erwan_LP on 03/05/2016.
 */
directives.push(
    {
        name: "exerciseListTeacherEdit",
        injections: ['GrainTypeService','GrainCopyService', (GrainTypeService, GrainCopyService) => {
            return {
                restrict: "E",
                scope : {
                  grain : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/exercise_list/teacherEdit.html',
                link:(scope : any, element, attrs) => {

                    scope.getTypeDirectiveEditNameByCurrentGrain = function(){
                        return GrainTypeService.getTypeDirectiveEditNameByGrainId(scope.grain.grain_type_id);
                    };

                }
            };
        }]
    }
);