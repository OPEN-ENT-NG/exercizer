directives.push(
    {
        name: 'subjectTree',
        injections: ['GrainService', 'GrainCopyService', (GrainService, GrainCopyService) => {
            return {
                restrict: 'E',
                scope: {
                    subject: "=",
                    subjectCopy: "=",
                    currentItem: '='

                },
                templateUrl: 'exercizer/public/app/templates/directives/widget/subjectTree.html',
                link: (scope:any, element, attrs) => {

                    /**
                     * Varibales
                     */
                    function isSubjectNav(){
                        return !!scope.subject;
                    }

                    function isSubjectCopyNav(){
                        return !!scope.subjectCopy;
                    }

                    /**
                     * Get item
                     * could be grain or grainCopy
                     * @returns {any}
                     */
                    scope.itemList = function () {
                        if (isSubjectNav()) {
                            return GrainService.grainListBySubjectId(scope.subject.id);
                        }
                        if (isSubjectCopyNav()) {
                            return GrainCopyService.grainCopyListBySubjectCopyId(scope.subjectCopy.id);
                        }
                    };

                    /**
                     * Get item Label
                     * @param item
                     * @returns {any}
                     */
                    scope.getItemLabel = function (item) {
                        if (isSubjectNav()) {
                            return GrainService.getGrainLabel(item);
                        }
                        if (isSubjectCopyNav()) {
                            return GrainCopyService.getGrainCopyLabel(item);
                        }
                    };


                    /**
                     * Click item in nav
                     * @param item
                     */
                    scope.clickOnOneItem = function (item) {
                        if(item.order){
                            scope.currentItem = item.order;
                        } else{
                            scope.currentItem = item;
                        }

                    };

                    /**
                     * Display
                     */
                    scope.display  = {
                        subjectPresentation : function(){
                            return isSubjectCopyNav();
                        },
                        subjectEndPage : function(){
                            return isSubjectCopyNav();
                        }
                    }

                }
            };
        }]
    }
);
