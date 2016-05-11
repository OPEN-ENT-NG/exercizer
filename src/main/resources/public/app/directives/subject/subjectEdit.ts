directives.push(
    {
        name: "subjectEdit",
        injections: [ 'SubjectService','GrainService','SelectedGrainService', (SubjectService, GrainService,SelectedGrainService) => {
            return {
                restrict: "E",
                scope : {
                    subject : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/subject/subjectEdit.html',
                link:(scope : any, element, attrs) => {



                    scope.grainList = function(){
                        var res =  GrainService.grainListBySubjectId(scope.subject.id);
                        return res;
                    };

                    scope.isNewGrain = function(grain){
                        if(grain){
                            if(grain.grain_type_id){
                                return "grain";
                            } else{
                                return "new";
                            }
                        }
                    };

                    scope.selectedGrainIdList = function(){
                        var res = SelectedGrainService.selectedGrainIdList.length;
                        return res;
                    };

                    scope.clickOnDelete =  function(){
                        SelectedGrainService.displayLightBoxDeleteGrain =  true;
                    };

                    scope.clickOnDuplicate = function(){
                        angular.forEach(SelectedGrainService.selectedGrainIdList, function(grain_id, key) {
                            var subject_id = SubjectService.currentSubjectId;
                            var grain = GrainService.grainByIdAndSubjectId(grain_id, subject_id);
                            var newGrain =  angular.copy(grain);
                            newGrain.order = null;
                            newGrain.grain_data.title += " (copie)";
                            GrainService.createGrain(
                                newGrain,
                                function(data){
                                    //success
                                },
                                function(err){
                                    console.error(err);
                                }
                            )
                        });
                    };


                }
            };
        }]
    }
);

