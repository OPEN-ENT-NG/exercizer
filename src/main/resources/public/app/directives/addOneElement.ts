/**
 * Created by Erwan_LP on 29/04/2016.
 */
directives.push(
    {
        name: "addOneElement",
        injections: ['GrainService','SubjectService', (GrainService, SubjectService) => {
            return {
                restrict: "E",
                templateUrl: 'exercizer/public/app/templates/directives/addOneElement.html',
                link:(scope : any, element, attrs) => {

                    scope.clickCreateNewGrain =function(){
                        console.log('clickCreateNewGrain');
                        var grain = GrainService.createObjectGrain();
                        var subject_id = SubjectService.currentSubjectId;
                        grain.subject_id = subject_id;
                        GrainService.createGrain(
                            grain,
                            function(data){
                                console.info('Creation grain');
                                console.info(data);
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