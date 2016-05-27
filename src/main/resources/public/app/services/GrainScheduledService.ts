interface IGrainScheduledService {
    persist(grainScheduled:IGrainScheduled):ng.IPromise<IGrainScheduled>;
    update(grainScheduled:IGrainScheduled):ng.IPromise<IGrainScheduled>;
    remove(grainScheduled:IGrainScheduled):ng.IPromise<boolean>;
    createFromGrain(grain:IGrain):IGrainScheduled;
    getListBySubjectScheludedId(subjectScheduledId:number):ng.IPromise<IGrainScheduled[]>;
}

class GrainScheduledService implements IGrainScheduledService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedBySubjectScheludedId:{[subjectScheduledId:number]:IGrainScheduled[]};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService,
        private _grainTypeService:IGrainTypeService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._listMappedBySubjectScheludedId = {};
    }

    public persist = function(grainScheduled:IGrainScheduled):ng.IPromise<IGrainScheduled> {
        var self = this,
            deferred = this._$q.defer();

        //TODO update when using real API
        grainScheduled.id = Math.floor(Math.random() * (999999999 - 1)) + 1; // TODO backend

        setTimeout(function(self, grainScheduled) {
            if (angular.isUndefined(self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id])) {
                self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id] = [];
            }

            self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id].push(grainScheduled);

            deferred.resolve(grainScheduled);
        }, 100, self, grainScheduled);

        return deferred.promise;
    };

    public update = function(grainScheduled:IGrainScheduled):ng.IPromise<IGrainScheduled> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, grainScheduled) {
            if (angular.isUndefined(self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id])) {
                self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id] = [];
            }

            var index = self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id].indexOf(grainScheduled);
            self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id][index] = grainScheduled;

            deferred.resolve(grainScheduled);
        }, 100, self, grainScheduled);

        return deferred.promise;
    };

    public remove = function(grainScheduled:IGrainScheduled):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, grainScheduled) {
            if (angular.isUndefined(self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id])) {
                self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id] = [];
            }

            var grainScheduledIndex = self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id].indexOf(grainScheduled);

            if (grainScheduledIndex !== -1) {
                self._listMappedBySubjectScheludedId[grainScheduled.subject_copy_id].splice(grainScheduledIndex, 1);
                deferred.resolve(true);
            }

            deferred.resolve(false);
        }, 100, self, grainScheduled);

        return deferred.promise;
    };

    public createFromGrain = function(grain:IGrain):IGrainScheduled {
        var grainScheduled = new GrainScheduled();

        grainScheduled.grain_type_id = grain.grain_type_id;
        grainScheduled.order = grain.order;
        grainScheduled.grain_data = CloneObjectHelper.clone(grain.grain_data, true);

        return grainScheduled;
    };

    public getListBySubjectScheludedId = function(subjectScheduledId:number):ng.IPromise<IGrainScheduled[]> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, subjectScheduledId) {
            if (angular.isUndefined(self._listMappedBySubjectScheludedId[subjectScheduledId])) {
                self._listMappedBySubjectScheludedId[subjectScheduledId] = [];
            }
            deferred.resolve(self._listMappedBySubjectScheludedId[subjectScheduledId]);
        }, 100, self, subjectScheduledId);


        return deferred.promise;
    };
}
