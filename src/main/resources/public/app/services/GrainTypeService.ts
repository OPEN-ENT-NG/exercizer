interface IGrainTypeService {
    getList():IGrainType[];
    getById(id:number):IGrainType;
    getPublicName(id:number):string;
    getIllustrationIconName(id:number):string;
    getIllustrationURL(id:number):string;
    instantiateCustomData(grainObject:any, grainTypeId:number):any;
    instantiateCustomCopyData(grainCopyObject:any, grainTypeId:number):any;
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
        this._resolve();
    }

    public getList = function():IGrainType[] {
        return MapToListHelper.toList(this._listMappedById);
    };
    
    public getById = function(id:number):IGrainType {
        return this._listMappedById[id];
    };

    public getPublicName = function(id:number):string {
        var grainType = this.getById(id);
        
        return grainType.public_name;
    };

    public getIllustrationIconName = function(id:number):string {
        var illustrationIconName = '';

        switch (id) {
            case 3:
                illustrationIconName = 'doc-text';
                break;
        }
        
        return illustrationIconName
    };

    public getIllustrationURL = function(id:number):string {
        var illustrationUrl = '',
            grainType = this.getById(id);

        if (id > 3) {
            return '/exercizer/public/assets/illustrations/' + grainType.illustration + '.html';
        }

        return illustrationUrl;
    };
    
    public instantiateCustomData = function(grainObject:any, grainTypeId:number):any {
        var customData = {};
        
        switch (grainTypeId) {
            case 3:
                customData = SerializationHelper.toInstance(new StatementCustomData(), grainObject.grain_data.custom_data);
                break;
            case 4:
                customData = SerializationHelper.toInstance(new SimpleAnswerCustomData(), grainObject.grain_data.custom_data);
                break;
            case 6:
                customData = SerializationHelper.toInstance(new MultipleAnswerCustomData(), grainObject.grain_data.custom_data);
                break;
            case 7:
                customData = SerializationHelper.toInstance(new QcmCustomData(), grainObject.grain_data.custom_data);
                break;
            case 8:
                customData = SerializationHelper.toInstance(new AssociationCustomData(), grainObject.grain_data.custom_data);
                break;
            case 9:
                customData = SerializationHelper.toInstance(new OrderCustomData(), grainObject.grain_data.custom_data);
                break;
            case 11:
                customData = new zonetext.CustomData(grainObject.grain_data.custom_data);
                break;
        }
        
        return customData;
    };

    public instantiateCustomCopyData = function(grainCopyObject:any, grainTypeId:number):any {
        var customData = {};

        switch (grainTypeId) {
            case 3:
                customData = SerializationHelper.toInstance(new StatementCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 4:
                customData = SerializationHelper.toInstance(new SimpleAnswerCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 6:
                customData = SerializationHelper.toInstance(new MultipleAnswerCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 7:
                customData = SerializationHelper.toInstance(new QcmCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 8:
                customData = SerializationHelper.toInstance(new AssociationCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 9:
                customData = SerializationHelper.toInstance(new OrderCustomCopyData(), grainCopyObject.grain_copy_data.custom_copy_data);
                break;
            case 11:
                customData = new zonetext.CustomData(grainCopyObject.grain_data.custom_data);
                break;
        }

        return customData;
    };

    private _resolve = function():ng.IPromise<IGrainType[]> {
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
                function(response) {
                    self._listMappedById = {};
                    
                    angular.forEach(response.data, function (grainTypeObject) {
                        var grainType = SerializationHelper.toInstance(new GrainType(), JSON.stringify(grainTypeObject));
                        self._listMappedById[grainType.id] = grainType;
                    });

                    deferred.resolve(self.getList());
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la récupération des types des éléments du sujet.');
                }
            );
        }
        return deferred.promise;
    };
}
