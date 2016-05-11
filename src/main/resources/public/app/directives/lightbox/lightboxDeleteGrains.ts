directives.push(
    {
        name: 'lightboxDeleteGrains',
        injections: ['SelectedGrainService','SubjectService','GrainService', (SelectedGrainService, SubjectService, GrainService) => {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'exercizer/public/app/templates/directives/lightbox/lightboxDeleteGrains.html',
                link:(scope : any, element, attrs) => {

                    var deleteMessageOneGrain = "Voulez-vous vraiment supprimer cet élement du sujet ?";
                    var deleteMessageMultipleGrain = "Voulez-vous vraiment supprimer ces élements du sujet ?";

                    scope.display = function(){
                        var res = SelectedGrainService.displayLightBoxDeleteGrain;
                        if(res){
                            if(SelectedGrainService.selectedGrainIdList.length == 1){
                                scope.deleteMessage = deleteMessageOneGrain;
                            } else if(SelectedGrainService.selectedGrainIdList.length > 1){
                                scope.deleteMessage = deleteMessageMultipleGrain;
                            } else{
                                //no grain selected;
                            }
                        }
                        return res;
                    };

                    scope.hide = function(){
                        SelectedGrainService.displayLightBoxDeleteGrain = false;
                    };

                    scope.deleteSelectedGrainList = function(){
                        angular.forEach(SelectedGrainService.selectedGrainIdList, function(grain_id, key) {
                            var subject_id = SubjectService.currentSubjectId;
                            var grain = GrainService.grainByIdAndSubjectId(grain_id, subject_id);
                            GrainService.deleteGrain(
                                grain,
                                function(data){
                                    //success
                                },
                                function(err){
                                    console.error(err);
                                }
                            )
                        });
                        SelectedGrainService.resetList();
                    }
                }
            };
        }]
    }
);
