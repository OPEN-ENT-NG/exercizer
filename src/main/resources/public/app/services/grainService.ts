interface IGrainService {
    persist(grain:IGrain):ng.IPromise<IGrain>;
    update(grain:IGrain):ng.IPromise<IGrain>;
    remove(grain:IGrain):ng.IPromise<boolean>;
    duplicate(grain:IGrain):ng.IPromise<IGrain>
    getListBySubjectId(subjectId:number):ng.IPromise<IGrain[]>;
}

class GrainService implements IGrainService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedBySubjectId:{[subjectId:number]:IGrain[]};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._listMappedBySubjectId = {};
    }

    public persist = function(grain:IGrain):ng.IPromise<IGrain> {
        var self = this,
            deferred = this._$q.defer();

        //TODO update when using real API
        grain.id = Math.floor(Math.random() * (999999999 - 1)) + 1;
        if (angular.isUndefined(grain.order_by)){
            grain = this._setOrderToGrain(grain);
        }
        
        setTimeout(function(self, grain) {
            if (angular.isUndefined(self._listMappedBySubjectId[grain.subject_id])) {
                self._listMappedBySubjectId[grain.subject_id] = [];
            }

            self._listMappedBySubjectId[grain.subject_id].push(grain);

            deferred.resolve(grain);
        }, 100, self, grain);

        return deferred.promise;
    };

    public update = function(grain:IGrain):ng.IPromise<IGrain> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, grain) {
            if (angular.isUndefined(self._listMappedBySubjectId[grain.subject_id])) {
                self._listMappedBySubjectId[grain.subject_id] = [];
            }

            var index = self._listMappedBySubjectId[grain.subject_id].indexOf(grain);
            self._listMappedBySubjectId[grain.subject_id][index] = grain;
            
            deferred.resolve(grain);
        }, 100, self, grain);

        return deferred.promise;
    };

    public remove = function(grain:IGrain):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, grain) {
            if (angular.isUndefined(self._listMappedBySubjectId[grain.subject_id])) {
                self._listMappedBySubjectId[grain.subject_id] = [];
            }

            var grainIndex = self._listMappedBySubjectId[grain.subject_id].indexOf(grain);

            if (grainIndex !== -1) {
                self._listMappedBySubjectId[grain.subject_id].splice(grainIndex, 1);
                deferred.resolve(true);
            }

            deferred.resolve(false);
        }, 100, self, grain);

        return deferred.promise;
    };

    public duplicate = function(grain:IGrain):ng.IPromise<IGrain> {

        var duplicatedGrain = CloneObjectHelper.clone(grain, true);
        duplicatedGrain.id = undefined;
        duplicatedGrain.order = undefined;

        if (duplicatedGrain.grain_type_id > 3) {
            duplicatedGrain.grain_data.title += '_copie';
        }

        return this.persist(duplicatedGrain);
    };


    public getListBySubjectId = function(subjectId:number):ng.IPromise<IGrain[]> {
        var self = this,
            deferred = this._$q.defer();

        //TODO remove when using real API
        setTimeout(function(self, subjectId) {
            if (angular.isUndefined(self._listMappedBySubjectId[subjectId])) {
                self._listMappedBySubjectId[subjectId] = [];
            }
            deferred.resolve(self._listMappedBySubjectId[subjectId]);
        }, 100, self, subjectId);


        return deferred.promise;
    };

    private _setOrderToGrain(grain:IGrain):IGrain {
        var maxOrder:number = null,
            newOrder:number;

        angular.forEach(this._listMappedBySubjectId[grain.subject_id], function(currentGrain) {
            if(!angular.isUndefined(currentGrain.order_by) && currentGrain.order_by > maxOrder) {
                maxOrder = currentGrain.order_by;
            }
        });

        if(!angular.isUndefined(maxOrder)){
            newOrder = Math.ceil(maxOrder) + 1;
        } else {
            newOrder = 1;
        }

        grain.order_by = newOrder;
        
        return grain;
    }
}
