directives.push(
    {
        name: "subjectPerform",
        injections: ['SubjectService', 'GrainCopyService', 'PreviewSubjectService', (SubjectService, GrainCopyService, PreviewSubjectService) => {
            return {
                restrict: "E",
                scope: {
                    subjectCopy: "=",
                    subjectScheduled: "=",
                    subjectState: "@"
                },
                templateUrl: 'exercizer/public/app/templates/directives/subject/subjectPerform.html',
                link: (scope:any, element, attrs) => {

                    /**
                     * VARIABLE
                     */

                    var currentOrder;
                    var lowerOrder;
                    var upperOrder;

                    var msgToDefine = "à définir lors de la programmation.";

                    /**
                     * INIT
                     */

                    function reset(){
                        currentOrder = "subjectPresentation";
                        lowerOrder = null;
                        upperOrder = null;
                    }
                    reset();

                    /**
                     * GET VARIABLE
                     */

                    scope.grainCopyList = function () {
                        if(scope.subjectCopy){
                            return  GrainCopyService.grainCopyListBySubjectCopyId(scope.subjectCopy.id);
                        }
                    };

                    scope.getSubjectTitle = function () {
                        if (scope.subjectScheduled) {
                            return scope.subjectScheduled.title;
                        }
                    };

                    scope.getSubjectMaxScore = function () {
                        if (scope.subjectScheduled) {
                            return scope.subjectScheduled.max_score;
                        }
                    };

                    scope.getDueDate = function(){
                        if(scope.subjectScheduled && scope.subjectScheduled.due_date){
                            return scope.subjectScheduled.due_date;
                        } else{
                            return msgToDefine;
                        }
                    };

                    scope.getDuration = function(){
                        if(scope.subjectScheduled && scope.subjectScheduled.duration){
                            return scope.subjectScheduled.duration;
                        } else{
                            return msgToDefine;
                        }
                    };

                    /**
                     * EVENT PAGE
                     */

                    scope.clickOnGrainCopyInNav = function (grain_copy) {
                        currentOrder = grain_copy.order;
                    };

                    scope.clickNextQuestion = function () {
                        currentOrder = findNextOrder(currentOrder);
                    };

                    scope.clickPreviousQuestion = function () {
                        currentOrder = findPreviousOrder(currentOrder);
                    };

                    scope.startSubject = function () {
                        lowerOrder = findLowerOrder();
                        upperOrder = findUpperOrder();
                        currentOrder = lowerOrder;
                    };

                    scope.clickOnAutoCorrection = function () {
                        PreviewSubjectService.initAutoCorrection();
                    };


                    /**
                     * PRIVATE FUNCTION ORDER
                     */

                    function isFirstQuestion() {
                        return currentOrder == lowerOrder
                    }

                    function isLastQuestion() {
                        return currentOrder == upperOrder
                    }

                    function findLowerOrder() {
                        var lower_order = null;
                        angular.forEach(scope.grainCopyList(), function (grain_copy, key) {
                            if (lower_order) {
                                if (grain_copy.order < lower_order) {
                                    lower_order = grain_copy.order;
                                }
                            } else {
                                lower_order = grain_copy.order;
                            }
                        });
                        return lower_order
                    }

                    function findUpperOrder() {
                        var upper_order = null;
                        angular.forEach(scope.grainCopyList(), function (grain_copy, key) {
                            if (upper_order) {
                                if (grain_copy.order > upper_order) {
                                    upper_order = grain_copy.order;
                                }
                            } else {
                                upper_order = grain_copy.order;
                            }
                        });
                        return upper_order
                    }

                    function findPreviousOrder(oldOrder) {
                        if (!oldOrder) {
                            throw "cant find new lower order because old order is not set"
                        }
                        var newOrder = null;
                        angular.forEach(scope.grainCopyList(), function (grain_copy, key) {
                            if (newOrder) {
                                if (grain_copy.order < oldOrder && grain_copy.order > newOrder) {
                                    newOrder = grain_copy.order;
                                }
                            } else {
                                if (grain_copy.order < oldOrder) {
                                    newOrder = grain_copy.order;
                                } else {
                                    // newOrder still null
                                }
                            }
                        });
                        if (!newOrder) {
                            throw "Not possible to access lower than the fist question"
                        }
                        return newOrder
                    }

                    function findNextOrder(oldOrder) {
                        if (!oldOrder) {
                            throw "cant find new lower order because previous lower order is not set"
                        }
                        var newOrder = null;
                        angular.forEach(scope.grainCopyList(), function (grain_copy, key) {
                            if (newOrder) {
                                if (grain_copy.order > oldOrder && grain_copy.order < newOrder) {
                                    newOrder = grain_copy.order;
                                }
                            } else {
                                if (grain_copy.order > oldOrder) {
                                    newOrder = grain_copy.order;
                                } else {
                                    // newOrder still null
                                }
                            }
                        });
                        if (!newOrder) {
                            throw "Not possible to access upper than the last question"
                        }
                        return newOrder
                    }


                    /**
                     * DISPLAY
                     */

                    scope.display = {
                        buttonReturnCopy: function () {
                            return scope.subjectState == "studentPerform"
                        },
                        buttonAutoCorrection: function () {
                            return scope.subjectState == "preview"
                        },
                        buttonBackToSubjectList: function () {
                            return scope.subjectState == "studentPerform"
                        },
                        pagePresentationSubject: function () {
                            return currentOrder == "subjectPresentation"
                        },
                        grainCopyByOrder: function (order) {
                            return currentOrder == order
                        },
                        buttonNextQuestion: function () {
                            return (!isLastQuestion() && currentOrder != "subjectPresentation")
                        },
                        buttonPreviousQuestion: function () {
                            return (!isFirstQuestion() && currentOrder != "subjectPresentation")
                        },
                        buttonStartSubject: function () {
                            return currentOrder == "subjectPresentation"
                        }
                    };

                    /**
                     * EXTERNAL EVENT
                     */
                    scope.$on('RESET_SUBJECT_PERFORM', function (event, result) {
                        reset();
                    });

                }
            };
        }]
    }
);

