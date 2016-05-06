/**
 * Created by Erwan_LP on 29/04/2016.
 */
directives.push(
    {
        name: "newGrain",
        injections: [ 'GrainTypeService','GrainService', (GrainTypeService, GrainService) => {
            return {
                restrict: "E",
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/templates/directives/newGrain.html',
                link:(scope : any, element, attrs) => {

                    scope.state = 'statementOrQuestion';

                    scope.clickStatement = function(){
                        var grain_type_id = GrainTypeService.getTypeIdByTypeName("statement");
                        scope.grain.grain_type_id = grain_type_id;
                    };
                    scope.clickQuestion = function(){
                        scope.state = 'choiceExerciseType';
                    };

                    scope.exerciseTypeList = function () {
                        return GrainTypeService.exerciseTypeList;
                    };

                    scope.clickExerciseType = function(type){
                        scope.grain.grain_type_id = type.id;
                        GrainService.updateGrain(
                            scope.grain,
                            function(data){
                                //success
                                console.info('Grain updated', data);
                            },
                            function(err){
                                console.error(err);
                            }
                        )
                    }
                }
            };
        }]
    }
);