directives.push(
    {
        name: 'editQcm',
        injections: ['GrainService', 'SubjectEditService', (GrainService:IGrainService, SubjectEditService:ISubjectEditService) => {
            return {
                restrict: 'E',
                scope: {
                    grain: '='
                },
                templateUrl: 'exercizer/public/app/components/grain/qcm/templates/edit-qcm.html',
                link:(scope:any) => {

                    if (angular.isUndefined(scope.grain.grain_data.custom_data)) {
                        console.log('coucou');
                        scope.grain.grain_data.custom_data = new QcmCustomData();
                    }

                    function _updateGrain() {
                        console.log(scope.grain);
                        GrainService.update(scope.grain).then(
                            function(grain:IGrain) {
                                scope.grain = grain;
                            },
                            function(err) {
                                notify.error(err);
                            }
                        );
                    }

                    scope.addAnswer = function() {
                        var newAnswer = {
                            isChecked : false,
                            text : ''
                        };
                        scope.grain.grain_data.custom_data.correct_answer_list.push(newAnswer);
                        
                        _updateGrain();
                    };

                    scope.deleteAnswer = function(answer){
                        var index = scope.grain.grain_data.custom_data.correct_answer_list.indexOf(answer);
                        if(index !== -1){
                            scope.grain.grain_data.custom_data.correct_answer_list.splice(index, 1);
                        }
                       
                        _updateGrain();
                    };

                    scope.isGrainFolded = function() {
                        return SubjectEditService.isGrainFolded(scope.grain);
                    };

                    scope.updateGrain = function() {
                        _updateGrain();
                    };
                }
            };
        }]
    }
);






