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

                    var currentOrder = "subjectPresentation";
                    var lowerOrder = null;
                    var upperOrder = null;
                    var _cacheGrainCopyList = null;

                    /**
                     * GRAIN LIST
                     */

                    scope.grainCopyList = function () {
                        if (_cacheGrainCopyList) {
                            // data here
                        } else {
                            if (scope.subjectCopy) {
                                _cacheGrainCopyList = GrainCopyService.grainCopyListBySubjectCopyId(scope.subjectCopy.id);
                            }
                        }
                        return _cacheGrainCopyList;
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
                        angular.forEach(_cacheGrainCopyList, function (grain_copy, key) {
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
                        angular.forEach(_cacheGrainCopyList, function (grain_copy, key) {
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
                        angular.forEach(_cacheGrainCopyList, function (grain_copy, key) {
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
                        angular.forEach(_cacheGrainCopyList, function (grain_copy, key) {
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
                     * GET VARIABLE
                     */

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
                    }
                }
            };
        }]
    }
);

