directives.push(
    {
        name: "grainListTeacherEdit",
        injections: ['GrainTypeService','GrainCopyService', (GrainTypeService, GrainCopyService) => {
            return {
                restrict: "E",
                scope : {
                  grain : "="
                },
                templateUrl: 'exercizer/public/app/templates/directives/grain_list/teacherEdit.html',
                link:(scope : any, element, attrs) => {

                    var typeDirectiveCurrentName;

                    function init(){
                        /**
                         * When toggle is false, the grain is in full view
                         * When toggle is true, the grain is in lite view
                         * @type {boolean}
                         */
                        scope.isToggle = false;
                        typeDirectiveCurrentName = GrainTypeService.getTypeDirectiveEditNameByGrainId(scope.grain.grain_type_id);
                    }
                    init();

                    scope.getTypeDirectiveEditNameByCurrentGrain = function(){
                        return typeDirectiveCurrentName;
                    };

                    scope.toggle = function(){
                        scope.isToggle = !scope.isToggle;
                    };

                }
            };
        }]
    }
);