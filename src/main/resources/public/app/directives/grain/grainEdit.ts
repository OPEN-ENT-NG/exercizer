directives.push(
    {
        name: "grainEdit",
        injections: ['GrainTypeService','GrainService','SelectedGrainService', (GrainTypeService, GrainService, SelectedGrainService) => {
            return {
                restrict: "E",
                scope : {
                  grain : "=",
                    grainState : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/grain/grainEdit.html',
                link:(scope : any, element, attrs) => {

                    var currentTypeName;

                    function init(){
                        /**
                         * When toggle is false, the grain is in full view
                         * When toggle is true, the grain is in lite view
                         * @type {boolean}
                         */
                        scope.isToggle = false;
                        currentTypeName = GrainTypeService.getTypeNameByTypeId(scope.grain.grain_type_id);
                    }
                    init();

                    scope.updateGrain = function(){
                        GrainService.updateGrain(
                            scope.grain,
                            function(data){
                                //success
                            },
                            function(err){
                                console.error(err);
                            }
                        )
                    };

                    scope.getTypeNameByCurrentGrain = function(){
                        return currentTypeName;
                    };

                    scope.eventToggleGrain = function(){
                        scope.isToggle = !scope.isToggle;
                    };

                    scope.eventDeleteGrain = function(){
                        SelectedGrainService.uniqueSelectedGrain(scope.grain);
                        SelectedGrainService.displayLightBoxDeleteGrain = true;
                    };

                    scope.eventSelectGrain = function(){
                        SelectedGrainService.toggleGrainInSelectedGrainList(scope.grain,scope.isGrainSelected );
                    };


                    /**
                     * EVENT
                     */
                    scope.$on('TOGGLE_ALL_GRAIN', function (event, result) {
                        scope.isToggle = true;
                    });
                }
            };
        }]
    }
);