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

                    var lowerOrder;
                    var upperOrder;
                    var msgToDefine = "à définir lors de la programmation.";

                    /**
                     * INIT
                     */

                    function reset(){
                        scope.currentOrder = "subjectPresentation";
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

                    scope.clickNextQuestion = function () {
                        var newOrder  = findNextOrder(scope.currentOrder);
                        if(newOrder){
                            scope.currentOrder = newOrder;
                        } else{
                            // new order = null means that current grain is the last grain
                            scope.currentOrder = 'subjectEndPage';
                        }
                    };

                    scope.clickPreviousQuestion = function () {
                        scope.currentOrder = findPreviousOrder(scope.currentOrder);
                    };

                    scope.startSubject = function () {
                        lowerOrder = findLowerOrder();
                        upperOrder = findUpperOrder();
                        scope.currentOrder = lowerOrder;
                    };

                    scope.clickOnAutoCorrection = function () {
                        PreviewSubjectService.initAutoCorrection();
                    };

                    scope.tackBackCopy = function(){
                      console.log('TODO : tackBackCopy');
                    };


                    /**
                     * PRIVATE FUNCTION ORDER
                     */

                    function isFirstQuestion() {
                        return scope.currentOrder == lowerOrder
                    }

                    function isLastQuestion() {
                        return scope.currentOrder == upperOrder
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
                        return newOrder
                    }


                    /**
                     * DISPLAY
                     */

                    scope.display = {
                        buttonAutoCorrection: function () {
                            return scope.subjectState == "preview"
                        },
                        buttonBackToSubjectList: function () {
                            return scope.subjectState == "studentPerform"
                        },
                        pagePresentationSubject: function () {
                            return scope.currentOrder == "subjectPresentation"
                        },
                        grainCopyByOrder: function (order) {
                            return scope.currentOrder == order
                        },
                        buttonNextQuestion: function () {
                            return (scope.currentOrder != "subjectPresentation" && scope.currentOrder != 'subjectEndPage');
                        },
                        buttonPreviousQuestion: function () {
                            return (!isFirstQuestion() && scope.currentOrder != "subjectPresentation" && scope.currentOrder != 'subjectEndPage')
                        },
                        buttonStartSubject: function () {
                            return scope.currentOrder == "subjectPresentation"
                        },
                        buttonReturnCopy : function(){
                            return scope.currentOrder == "subjectEndPage"
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

