import IWindowService = ng.IWindowService;
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
    private _hasDataLoaded: boolean;

    constructor
    (
        private _$routeParams,
        private _$scope:ng.IScope,
        private _$location:ng.ILocationService,
        private _subjectService:ISubjectService,
        private _subjectScheduledService:ISubjectScheduledService,
        private _subjectCopyService:ISubjectCopyService,
        private _grainService:IGrainService,
        private _grainTypeService:IGrainTypeService
    ) {

        this._$scope = _$scope;
        this._$location = _$location;
        this._subjectService = _subjectService;
        this._subjectScheduledService = _subjectScheduledService;
        this._subjectCopyService = _subjectCopyService;
        this._grainService = _grainService;
        this._grainTypeService = _grainTypeService;
        this._hasDataLoaded = false;

        var self = this,
            subjectId = _$routeParams['subjectId'];

        this._subjectService.resolve().then(function() {
            self._subject = self._subjectService.getById(subjectId);

            if (angular.isUndefined(self._subject)) {
                self.redirectToDashboard();
            } else {
                self._selectedGrainList = [];
                self._eventsHandler(self);
            }

        }, function(err) {
            notify.error(err);
        });
    }

    public redirectToDashboard() {
        this._$location.path('/dashboard');
    }

    private _eventsHandler = function (self) {

        function _handleGrainListUpdated() {
            self._grainService.getListBySubject(self._subject).then(
                function (grainList) {
                    var maxScore = 0;
                    angular.forEach(grainList, function (grain:IGrain) {
                        if (grain.grain_type_id > 3 && !angular.isUndefined(grain.grain_data.max_score)) {
                            if (angular.isString(grain.grain_data.max_score)) {
                                grain.grain_data.max_score = parseFloat(grain.grain_data.max_score.toString());
                            }
                            maxScore += grain.grain_data.max_score
                        } else if (grain.grain_type_id === 3) {
                            
                        }
                    });

                    self._subject.max_score = maxScore;

                    self._subjectService.update(self._subjectService.getById(self._subject.id)).then(
                        function (subject:ISubject) {
                            self._subject = subject;
                            self._$scope.$broadcast('E_REFRESH_GRAIN_LIST', grainList);
                            self._$scope.$broadcast('E_TOGGLE_SUBJECT_EDIT_TOASTER', self._selectedGrainList.length);
                            self._hasDataLoaded = true;
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

        self._$scope.$on('E_GRAIN_LIST_UPDATED', function () {
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

        self._$scope.$on('E_ADD_GRAIN', function (event, grain:IGrain) {
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

        self._$scope.$on('E_UPDATE_GRAIN', function (event, grain:IGrain) {
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

        self._$scope.$on('E_REMOVE_GRAIN', function (event, grain:IGrain) {
            self._$scope.$broadcast('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN', grain);
        });

        self._$scope.$on('E_CONFIRM_REMOVE_GRAIN', function (event, grain:IGrain) {
            _handleRemoveGrain(grain);
        });

        function _handleGrainToggled(grain:IGrain) {
            self._$scope.$broadcast('E_TOGGLE_GRAIN', grain);
        }

        self._$scope.$on('E_GRAIN_TOGGLED', function (event, grain:IGrain) {
            _handleGrainToggled(grain);
        });

        self._$scope.$on('E_FOLD_GRAIN_LIST', function () {
            self._$scope.$broadcast('E_FORCE_FOLDING_GRAIN');
        });

        function _handleGrainSelected(grain:IGrain) {
            var grainIndex = self._selectedGrainList.indexOf(grain);

            if (grainIndex !== -1) {
                self._selectedGrainList.splice(grainIndex, 1);
            } else {
                self._selectedGrainList.push(grain);
                self._selectedGrainList.sort(function(grainA:IGrain, grainB:IGrain) {
                    return grainA.order_by - grainB.order_by;
                })
            }

            self._$scope.$broadcast('E_SELECT_GRAIN', grain);
            self._$scope.$broadcast('E_TOGGLE_SUBJECT_EDIT_TOASTER', self._selectedGrainList.length);
        }

        self._$scope.$on('E_GRAIN_SELECTED', function (event, grain:IGrain) {
            _handleGrainSelected(grain);
        });

        function _handleDuplicateSelectedGrain() {
            var grain = self._selectedGrainList[0];
            self._grainService.duplicate(grain, self._subject).then(
                function () {
                    self._selectedGrainList.splice(0, 1);
                    self._$scope.$broadcast('E_SELECT_GRAIN', grain);
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

        self._$scope.$on('E_DUPLICATE_SELECTED_GRAIN_LIST', function () {
            _handleDuplicateSelectedGrain();
        });

        function _handleRemoveSelectedGrain() {
            var grain = self._selectedGrainList[0];
            self._grainService.remove(grain).then(
                function () {
                    self._selectedGrainList.splice(0, 1);
                    self._$scope.$broadcast('E_SELECT_GRAIN', grain);
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

        self._$scope.$on('E_REMOVE_SELECTED_GRAIN_LIST', function () {
            self._$scope.$broadcast('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_SELECTED_GRAIN_LIST');
        });

        self._$scope.$on('E_CONFIRM_REMOVE_SELECTED_GRAIN_LIST', function () {
            _handleRemoveSelectedGrain();
        });

        self._$scope.$on('E_ADD_GRAIN_DOCUMENT', function (event, grain:IGrain) {
            self._$scope.$broadcast('E_DISPLAY_SUBJECT_EDIT_MODAL_GRAIN_DOCUMENT', grain);
        });

        self._$scope.$on('E_CONFIRM_ADD_GRAIN_DOCUMENT', function (event, grain:IGrain) {
            _handleUpdateGrain(grain);
        });

        self._$scope.$on('E_REMOVE_GRAIN_DOCUMENT', function (event, grain:IGrain, grainDocument:IGrainDocument) {
            self._$scope.$broadcast('E_DISPLAY_SUBJECT_EDIT_MODAL_REMOVE_GRAIN_DOCUMENT', grain, grainDocument);
        });

        self._$scope.$on('E_CONFIRM_REMOVE_GRAIN_DOCUMENT', function (event, grain:IGrain) {
            _handleUpdateGrain(grain);
        });

        self._$scope.$on('E_PREVIEW_PERFORM_SUBJECT_COPY', function () {
            _handleGrainListUpdated();
            self._$scope.$broadcast('E_DISPLAY_MODAL_PREVIEW_PERFORM_SUBJECT_COPY');

        });

        // init
        _handleGrainListUpdated();
    };

    get subject():ISubject {
        return this._subject;
    }

    get hasDataLoaded():boolean {
        return this._hasDataLoaded;
    }
}

