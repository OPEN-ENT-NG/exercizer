interface IGrainService {
    persist(grain:IGrain):ng.IPromise<IGrain>;
    update(grain:IGrain):ng.IPromise<IGrain>;
    remove(grain:IGrain):ng.IPromise<boolean>;
    duplicate(grain:IGrain):ng.IPromise<IGrain>
    getListBySubject(subject: ISubject):ng.IPromise<IGrain[]>;
    instantiateGrain(grainObject:any):IGrain;
}

class GrainService implements IGrainService {

    static $inject = [
        '$q',
        '$http',
        'GrainTypeService'
    ];

    private _listMappedBySubjectId:{[subjectId:number]:IGrain[]};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService,
        private _grainTypeService:IGrainTypeService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._grainTypeService = _grainTypeService;
        this._listMappedBySubjectId = {};
    }

    public persist = function(grain:IGrain):ng.IPromise<IGrain> {
        var self = this,
            deferred = this._$q.defer();

        if (angular.isUndefined(grain.order_by)) {
            grain = this._setOrderToGrain(grain);
        }

        /*var grainObject = angular.copy(grain);
        grainObject.grain_data = JSON.stringify(grainObject.grain_data);*/

        var request = {
                method: 'POST',
                url: 'exercizer/grain',
                data: grain
            };

        this._$http(request).then(
            function(response) {
                var grain = self.instantiateGrain(response.data);
                
                if (angular.isUndefined(self._listMappedBySubjectId[grain.subject_id])) {
                    self._listMappedBySubjectId[grain.subject_id] = [];
                }
                
                self._listMappedBySubjectId[grain.subject_id].push(grain);
                
                deferred.resolve(grain);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la création de l\'élément.')
            }
        );

        return deferred.promise;
    };

    public update = function(grain:IGrain):ng.IPromise<IGrain> {
        var self = this,
            deferred = this._$q.defer();

        /*var grainObject = angular.copy(grain);
        grainObject.grain_data = JSON.stringify(grainObject.grain_data);*/

        var request = {
            method: 'PUT',
            url: 'exercizer/grain',
            data: grain
        };

        this._$http(request).then(
            function(response) {
                var grain = self.instantiateGrain(response.data);

                if (angular.isUndefined(self._listMappedBySubjectId[grain.subject_id])) {
                    self._listMappedBySubjectId[grain.subject_id] = [];
                }
                
                var index = self._listMappedBySubjectId[grain.subject_id].indexOf(grain);
                self._listMappedBySubjectId[grain.subject_id][index] = grain;

                deferred.resolve(grain);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la mise à jour de l\'élément.')
            }
        );

        return deferred.promise;
    };

    public remove = function(grain:IGrain):ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        var grainObject = angular.copy(grain);
        grainObject.grain_data = JSON.stringify(grainObject.grain_data);

        var request = {
            method: 'DELETE',
            url: 'exercizer/grain',
            data: grainObject
        };

        this._$http(request).then(
            function(response) {
                console.log(response);
            },
            function() {
                deferred.reject('Un erreur est survenue lors de la suppression de l\'élément.')
            }
        );

        
        return deferred.promise;
    };

    public duplicate = function(grain:IGrain, keepOrder: boolean = false):ng.IPromise<IGrain> {

        var duplicatedGrain = CloneObjectHelper.clone(grain, true);
        duplicatedGrain.id = undefined;
        
        if (keepOrder === false){
            duplicatedGrain.order_by = undefined;
        }

        if (duplicatedGrain.grain_type_id > 3) {
            duplicatedGrain.grain_data.title += '_copie';
        }

        return this.persist(duplicatedGrain);
    };

    public copyOf = function(grain:IGrain):ng.IPromise<IGrain> {
        var duplicatedGrain = CloneObjectHelper.clone(grain, true);
        duplicatedGrain.id = undefined;
        return duplicatedGrain;
    };


    public getListBySubject = function(subject:ISubject):ng.IPromise<IGrain[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/grains',
                data : subject
            };

        if (!angular.isUndefined(this._listMappedBySubjectId[subject.id])) {
            deferred.resolve(this._listMappedBySubjectId[subject.id]);
        } else {
            
            this._listMappedBySubjectId[subject.id] = [];

            this._$http(request).then(
                function (response) {
                    angular.forEach(response.data, function (grainObject) {
                        self._listMappedBySubjectId[subject.id].push(self.instantiateGrain(grainObject));
                    });
                    
                    deferred.resolve(self._listMappedBySubjectId[subject.id]);
                },
                function () {
                    deferred.reject('Une erreur est survenue lors de la récupération de vos grain.');
                }
            );
        }

        return deferred.promise;
    };

    public instantiateGrain = function(grainObject:any):IGrain {
        var grain = SerializationHelper.toInstance(new Grain(), JSON.stringify(grainObject));
        grain.grain_data.custom_data = this._grainTypeService.instantiateCustomData(grainObject, grain.grain_type_id);

        return grain;
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
