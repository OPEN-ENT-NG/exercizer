interface IGrainService {
    persist(grain:IGrain):ng.IPromise<IGrain>;
    update(grain:IGrain):ng.IPromise<IGrain>;
    remove(grain:IGrain):ng.IPromise<boolean>;
    duplicate(grain:IGrain):ng.IPromise<IGrain>
    getListBySubject(subject: ISubject):ng.IPromise<IGrain[]>;
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

        if (angular.isUndefined(grain.order_by)) {
            console.log(grain);
            grain = this._setOrderToGrain(grain);
        }

        var grainObject = angular.copy(grain);
        grainObject.grain_data = JSON.stringify(grainObject.grain_data);

        var request = {
                method: 'POST',
                url: 'exercizer/grain',
                data: grainObject
            };

        this._$http(request).then(
            function(response) {
                console.log(response)
            },
            function(error) {
                console.error(error)
            }
        );


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

    public duplicate = function(grain:IGrain, keepOrder: boolean = false):ng.IPromise<IGrain> {

        var duplicatedGrain = CloneObjectHelper.clone(grain, true);
        duplicatedGrain.id = undefined;
        if(keepOrder === false){
            duplicatedGrain.order = undefined;
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
        var deferred = this._$q.defer();
        // TODO change
        if (!angular.isUndefined(this._listMappedBySubjectId[subject.id])) {
            deferred.resolve(this._listMappedBySubjectId[subject.id]);
        } else {
            var self = this,
                request = {
                    method: 'POST',
                    url: 'exercizer/grains',
                    data : subject
                };

            this._$http(request).then(
                function (response) {
                    self._listMappedBySubjectId = {};
                    var grain;
                    angular.forEach(response.data, function (grainObject) {
                        var grainJson = JSON.stringify(grainObject);
                        grain = SerializationHelper.toInstance(new Grain(), grainJson);
                        grain.grain_data = SerializationHelper.toInstance(new GrainData(), grainObject.grain_data);
                        switch (grain.grain_type_id){
                            case 4:
                                grain.grain_data.cutom_data =  SerializationHelper.toInstance(new SimpleAnswerCustomData(), grainObject.grain_data.cutom_data);
                                break;
                            case 5:
                                // no custom data
                                break;
                            case 6:
                                grain.grain_data.cutom_data =  SerializationHelper.toInstance(new MultipleAnswerCustomData(), grainObject.grain_data.cutom_data);
                                break;
                            case 7:
                                grain.grain_data.cutom_data =  SerializationHelper.toInstance(new QcmCustomData(), grainObject.grain_data.cutom_data);
                                break;
                            case 8:
                                grain.grain_data.cutom_data =  SerializationHelper.toInstance(new AssociationCustomData(), grainObject.grain_data.cutom_data);
                                break;
                            case 9:
                                grain.grain_data.cutom_data =  SerializationHelper.toInstance(new OrderCustomData(), grainObject.grain_data.cutom_data);
                                break;
                            default:
                                if (grain.grain_type_id === 1 || grain.grain_type_id === 2 ||grain.grain_type_id === 3){
                                    // ok
                                } else{
                                    console.error('type not defined');
                                }
                        }
                        self._listMappedBySubjectId[subject.id] = grain;
                    });
                    deferred.resolve(self._listMappedBySubjectId[subject.id]);
                },
                function () {
                    deferred.reject('Une erreur est survenue lors de la récupération de vos grain.');
                }
            );
        }



        //TODO remove when using real API
        setTimeout(function(self, subject) {
            if (angular.isUndefined(self._listMappedBySubjectId[subject.id])) {
                self._listMappedBySubjectId[subject.id] = [];
            }
            deferred.resolve(self._listMappedBySubjectId[subject.id]);
        }, 100, self, subject);


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
