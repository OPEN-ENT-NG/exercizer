interface IGrainScheduledService {
    persist(grainScheduled:IGrainScheduled, subject : ISubject):ng.IPromise<IGrainScheduled>;
    getListBySubjectScheduled(subjectScheduled:ISubjectScheduled):ng.IPromise<IGrainScheduled[]>;
    instantiateGrainScheduled(grainScheduledObject:any): IGrainScheduled;
    createGrainScheduledList(grainList:IGrain[]):IGrainScheduled[];
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
                url: 'exercizer/grain-scheduled/' + subject.id,
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
                deferred.reject('Une erreur est survenue lors de la création d\'un élément du sujet programmé.');
            }
        );
        return deferred.promise;
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
                        self._listMappedBySubjectScheduledId[subjectScheduled.id].push(self.instantiateGrainScheduled(grainScheduledObject));
                    });
                    deferred.resolve(self._listMappedBySubjectScheduledId[subjectScheduled.id]);
                },
                function () {
                    deferred.reject('Une erreur est survenue lors de la récupération des éléments du sujet programmé.');
                }
            );
        }
        return deferred.promise;
    };

    public instantiateGrainScheduled = function (grainScheduledObject:any):IGrainScheduled {
        var grainScheduled = SerializationHelper.toInstance(new GrainScheduled(), JSON.stringify(grainScheduledObject));
        grainScheduled.grain_data = SerializationHelper.toInstance(new GrainData(), grainScheduledObject.grain_data);
        return grainScheduled;
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

    private _createFromGrain = function(grain:IGrain):IGrainScheduled {
        var grainScheduled = new GrainScheduled();

        grainScheduled.grain_type_id = grain.grain_type_id;
        grainScheduled.order_by = grain.order_by;
        grainScheduled.grain_data = CloneObjectHelper.clone(grain.grain_data, true);

        return grainScheduled;
    };
}
