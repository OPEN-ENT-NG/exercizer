interface IGrainTypeService {
    resolve():ng.IPromise<IGrainType[]>
    getList():IGrainType[];
    getById(id:number):IGrainType;
}

class GrainTypeService implements IGrainTypeService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:IGrainType};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
    }

    public resolve = function():ng.IPromise<IGrainType[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/grain-types'
            };

        if (!angular.isUndefined(this._listMappedById)) {
            deferred.resolve(this.getList());
        } else {
            this._$http(request).then(
                function (response) {
                    self._listMappedById = {};
                    angular.forEach(response.data, function (grainTypeObject) {
                        var grainType = SerializationHelper.toInstance(new GrainType(), JSON.stringify(grainTypeObject));
                        self._listMappedById[grainType.id] = grainType;
                    });

                    deferred.resolve(self.getList());
                },
                function () {
                    deferred.reject('Une erreur est survenue lors de la récupération des types des éléments du sujet.');
                }
            );
        }

        return deferred.promise;
    };

    public getList = function():IGrainType[] {
        return MapToListHelper.toList(this._listMappedById);
    };
    
    public getById = function(id:number):IGrainType {
        return this._listMappedById[id];
    };
}
