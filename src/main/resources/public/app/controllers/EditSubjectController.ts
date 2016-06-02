class EditSubjectController {

    static $inject = [
        '$routeParams',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainService',
        'GrainTypeService'
    ];

    private _subject:ISubject;
    private _selectedGrainList:IGrain[];

    constructor
    ($routeParams,
     private _$scope:ng.IScope,
     private _$location:ng.ILocationService,
     private _subjectService:ISubjectService,
     private _subjectScheduledService:ISubjectScheduledService,
     private _subjectCopyService:ISubjectCopyService,
     private _grainService:IGrainService,
     private _grainTypeService:IGrainTypeService) {
        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService = _subjectCopyService;
        this._grainService = _grainService;
        this._grainTypeService = _grainTypeService;

        // SUBJECT ID BY URL
        var subjectId = $routeParams.subjectId;
        var promise = this._subjectService.loadSubjectList();
        var self = this;
        promise.then(function (data) {
            self._subject = self._subjectService.getById(subjectId);
            if (!self._subject) {
                console.log('redirect');
                //self._$location.path('/dashboard');
            } else {
                self._subjectService.currentSubjectId = subjectId;
                self._selectedGrainList = [];
                self._eventsHandler(self);
            }
        }, function (msg) {
            notify.error(msg);

        });
    }

    private _eventsHandler = function (self) {

        function _handleGrainListUpdated() {

            self._grainService.getListBySubject(self._subject).then(
                function (grainList) {
                    console.log(grainList);
                    var maxScore = 0;
                    angular.forEach(grainList, function (grain:IGrain) {
                        if (grain.grain_type_id > 3 && !angular.isUndefined(grain.grain_data.max_score)) {
                            maxScore += grain.grain_data.max_score;
                        }
                    });

                    self._subject.max_score = maxScore;

                    self._subjectService.update(self._subject).then(
                        function (subject:ISubject) {
                            self._subject = subject;
                            self._$scope.$broadcast("E_REFRESH_GRAIN_LIST", grainList);
                            self._$scope.$broadcast("E_TOGGLE_SUBJECT_EDIT_TOASTER", self._selectedGrainList.length);
                        },
                        function (err) {
                            notify.error(err);
                        }
                    );
                },
                function (err) {
                    notify.error(err);
                }
            );
        }

        self._$scope.$on("E_GRAIN_LIST_UPDATED", function () {
            _handleGrainListUpdated();
        });

        function _handleAddGrain(grain:IGrain) {
            self._grainService.persist(grain).then(
                function () {
                    _handleGrainListUpdated();
                },
                function (err) {
                    notify.error(err);
                }
            );
        }

        self._$scope.$on("E_ADD_GRAIN", function (event, grain:IGrain) {
            _handleAddGrain(grain);
        });

        function _handleUpdateGrain(grain:IGrain) {
            self._grainService.update(grain).then(
                function () {
                    _handleGrainListUpdated();
                },
                function (err) {
                    notify.error(err);
                }
            );
        }

        self._$scope.$on("E_UPDATE_GRAIN", function (event, grain:IGrain) {
            _handleUpdateGrain(grain);
        });

        function _handleRemoveGrain(grain:IGrain) {
            self._grainService.remove(grain).then(
                function () {
                    var grainIndex = self._selectedGrainList.indexOf(grain);

                    if (grainIndex !== -1) {
                        self._selectedGrainList.splice(grainIndex, 1);
                    }

                    _handleGrainListUpdated();
                },
                function (err) {
                    notify.error(err);
                }
            );
        }

        self._$scope.$on("E_REMOVE_GRAIN", function (event, grain:IGrain) {
            self._$scope.$broadcast("E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN", grain);
        });

        self._$scope.$on("E_CONFIRM_REMOVE_GRAIN", function (event, grain:IGrain) {
            _handleRemoveGrain(grain);
        });

        function _handleGrainToggled(grain:IGrain) {
            if (grain.grain_type_id > 2) {
                _handleUpdateGrain(grain);
            }
            self._$scope.$broadcast("E_TOGGLE_GRAIN", grain);
        }

        self._$scope.$on("E_GRAIN_TOGGLED", function (event, grain:IGrain) {
            _handleGrainToggled(grain);
        });

        function _handleFoldGrainList() {
            self._grainService.getListBySubject(self._subjectd).then(
                function (grainList) {
                    angular.forEach(grainList, function (grain:IGrain) {
                        if (grain.grain_type_id > 2) {
                            _handleUpdateGrain(grain);
                        }
                    });
                    self._$scope.$broadcast("E_FORCE_FOLDING_GRAIN");
                },
                function (err) {
                    notify.error(err);
                }
            );
        }

        self._$scope.$on("E_FOLD_GRAIN_LIST", function () {
            _handleFoldGrainList();
        });

        function _handleGrainSelected(grain:IGrain) {
            var grainIndex = self._selectedGrainList.indexOf(grain);

            if (grainIndex !== -1) {
                self._selectedGrainList.splice(grainIndex, 1);
            } else {
                self._selectedGrainList.push(grain);
            }

            self._$scope.$broadcast("E_TOGGLE_SUBJECT_EDIT_TOASTER", self._selectedGrainList.length);
        }

        self._$scope.$on("E_GRAIN_SELECTED", function (event, grain:IGrain) {
            _handleGrainSelected(grain);
        });

        function _handleDuplicateSelectedGrain() {
            var grain = self._selectedGrainList[0];
            self._grainService.duplicate(grain).then(
                function () {
                    self._selectedGrainList.splice(0, 1);
                    self._$scope.$broadcast("E_SELECT_GRAIN", grain);
                    if (self._selectedGrainList.length > 0) {
                        _handleDuplicateSelectedGrain();
                    } else {
                        _handleGrainListUpdated();
                    }
                },
                function (err) {
                    notify.error(err);
                }
            );
        }

        self._$scope.$on("E_DUPLICATE_SELECTED_GRAIN_LIST", function () {
            _handleDuplicateSelectedGrain();
        });

        function _handleRemoveSelectedGrain() {
            var grain = self._selectedGrainList[0];
            self._grainService.remove(grain).then(
                function () {
                    self._selectedGrainList.splice(0, 1);
                    self._$scope.$broadcast("E_SELECT_GRAIN", grain);
                    if (self._selectedGrainList.length > 0) {
                        _handleRemoveSelectedGrain();
                    } else {
                        _handleGrainListUpdated();
                    }
                },
                function (err) {
                    notify.error(err);
                }
            );
        }

        self._$scope.$on("E_REMOVE_SELECTED_GRAIN_LIST", function () {
            self._$scope.$broadcast("E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_SELECTED_GRAIN_LIST");
        });

        self._$scope.$on("E_CONFIRM_REMOVE_SELECTED_GRAIN_LIST", function () {
            _handleRemoveSelectedGrain();
        });

        self._$scope.$on("E_ADD_GRAIN_DOCUMENT", function (event, grain:IGrain) {
            self._$scope.$broadcast("E_DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT", grain);
        });

        self._$scope.$on("E_CONFIRM_ADD_GRAIN_DOCUMENT", function (event, grain:IGrain) {
            _handleUpdateGrain(grain);
        });

        self._$scope.$on("E_REMOVE_GRAIN_DOCUMENT", function (event, grain:IGrain, grainDocument:IGrainDocument) {
            self._$scope.$broadcast("E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN_DOCUMENT", grain, grainDocument);
        });

        self._$scope.$on("E_CONFIRM_REMOVE_GRAIN_DOCUMENT", function (event, grain:IGrain) {
            _handleUpdateGrain(grain);
        });

        self._$scope.$on("E_PREVIEW_PERFORM_SUBJECT_COPY", function () {
            self._$scope.$broadcast("E_DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT_COPY");

        });

        // init
        _handleGrainListUpdated();
    };

    get subject():ISubject {
        return this._subject;
    }

    set subject(value:ISubject) {
        this._subject = value;
    }

    public goHome() {
        this._$location.path('/teacher/home');
    }
}

