interface IGrainScheduledService {
    persist(grainScheduled:IGrainScheduled, subject : ISubject):ng.IPromise<IGrainScheduled>;
    update(grainScheduled:IGrainScheduled):ng.IPromise<IGrainScheduled>;
    remove(grainScheduled:IGrainScheduled):ng.IPromise<boolean>;
    createGrainScheduledList(grainList:IGrain[]):IGrainScheduled[];
    getListBySubjectScheduled(subjectScheduled:ISubjectScheduled):ng.IPromise<IGrainScheduled[]>;
}

class GrainScheduledService implements IGrainScheduledService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedBySubjectScheduledId:{[subjectScheduledId:number]:IGrainScheduled[]};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._listMappedBySubjectScheduledId = {};
    }

    public persist = function(grainScheduled:IGrainScheduled, subject : ISubject):ng.IPromise<IGrainScheduled> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/grain-scheduled/'+ subject.id,
                data: grainScheduled
            };
        this._$http(request).then(
            function(response) {
                var subjectScheduled = SerializationHelper.toInstance(new SubjectScheduled(), JSON.stringify(response.data)) as any;
                if (angular.isUndefined(self._listMappedBySubjectScheduledId[subjectScheduled.id])) {
                    self._listMappedBySubjectScheduledId[subjectScheduled.id] = [];
                }

                self._listMappedBySubjectScheduledId[subjectScheduled.id].push(subjectScheduled);

                deferred.resolve(subjectScheduled);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la sauvegarde d un exercie programmer.');
            }
        );
        return deferred.promise;
    };

    public update = function(grainScheduled:IGrainScheduled):ng.IPromise<IGrainScheduled> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, grainScheduled) {
            if (angular.isUndefined(self._listMappedBySubjectScheduledId[grainScheduled.subject_copy_id])) {
                self._listMappedBySubjectScheduledId[grainScheduled.subject_copy_id] = [];
            }

            var index = self._listMappedBySubjectScheduledId[grainScheduled.subject_copy_id].indexOf(grainScheduled);
            self._listMappedBySubjectScheduledId[grainScheduled.subject_copy_id][index] = grainScheduled;

            deferred.resolve(grainScheduled);
        }, 100, self, grainScheduled);

        return deferred.promise;
    };

    public remove = function(grainScheduled:IGrainScheduled):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, grainScheduled) {
            if (angular.isUndefined(self._listMappedBySubjectScheduledId[grainScheduled.subject_copy_id])) {
                self._listMappedBySubjectScheduledId[grainScheduled.subject_copy_id] = [];
            }

            var grainScheduledIndex = self._listMappedBySubjectScheduledId[grainScheduled.subject_copy_id].indexOf(grainScheduled);

            if (grainScheduledIndex !== -1) {
                self._listMappedBySubjectScheduledId[grainScheduled.subject_copy_id].splice(grainScheduledIndex, 1);
                deferred.resolve(true);
            }

            deferred.resolve(false);
        }, 100, self, grainScheduled);

        return deferred.promise;
    };
    
    public createGrainScheduledList = function(grainList:IGrain[]):IGrainScheduled[] {
        var grainScheduledList = [];
        angular.forEach(grainList, function(grain:IGrain) {
            if (grain.grain_type_id > 2) {
                grainScheduledList.push(this._createFromGrain(grain));
            }
        }, this);
        return grainScheduledList;
    };

    public getListBySubjectScheduled = function(subjectScheduled:ISubjectScheduled):ng.IPromise<IGrainScheduled[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/grains-scheduled',
                data: subjectScheduled
            };

        if (!angular.isUndefined(self._listMappedBySubjectScheduledId[subjectScheduled.id])) {
            deferred.resolve(self._listMappedBySubjectScheduledId[subjectScheduled.id]);
        } else {
            self._listMappedBySubjectScheduledId[subjectScheduled.id] = [];
            this._$http(request).then(
                function (response) {
                    angular.forEach(response.data, function (grainScheduledObject) {
                        var grainScheduled = SerializationHelper.toInstance(new GrainScheduled(), JSON.stringify(grainScheduledObject));
                        self._listMappedBySubjectScheduledId[subjectScheduled.id].push(grainScheduled);
                    });
                    deferred.resolve(self._listMappedBySubjectScheduledId[subjectScheduled.id]);
                },
                function () {
                    deferred.reject('Une erreur est survenue lors de la récupération de vos grain.');
                }
            );
        }
        return deferred.promise;
    };

    private _createFromGrain = function(grain:IGrain):IGrainScheduled {
        var grainScheduled = new GrainScheduled();

        grainScheduled.grain_type_id = grain.grain_type_id;
        grainScheduled.order_by = grain.order_by;
        grainScheduled.grain_data = CloneObjectHelper.clone(grain.grain_data, true);

        return grainScheduled;
    };
}
