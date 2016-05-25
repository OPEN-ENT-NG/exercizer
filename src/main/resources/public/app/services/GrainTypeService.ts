interface IGrainTypeService {
    getList():IGrainType[];
    getById(id:number):IGrainType;
    getByName(name:string):IGrainType;
}

class GrainTypeService implements IGrainTypeService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:IGrainType};
    private _listMappedByName: {[name:string]:IGrainType};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
        this._listMappedById = {};
        this._listMappedByName = {};

        // TODO remove when using real api
        var grainTypeList:IGrainType[] = [],
            self = this;
        
        grainTypeList.push(new GrainType(1, 'choose', 'À définir'));
        grainTypeList.push(new GrainType(2, 'chooseAnswer', 'Choix de la question à définir'));
        grainTypeList.push(new GrainType(3, 'statement', 'Énoncé', 'doc-text'));
        grainTypeList.push(new GrainType(4, 'simple_answer', 'Réponse simple', 'simple'));
        
        angular.forEach(grainTypeList, function(grainType:IGrainType) {
            self._listMappedById[grainType.id] = grainType;
            self._listMappedByName[grainType.name] = grainType;
        });
    }

    public getList = function():IGrainType[] {
        var self = this;

        return Object.keys(this._listMappedById).map(function(v) {
            return this._listMappedById[v];
        }, self);
    };
    
    public getById = function(id:number):IGrainType {
        return this._listMappedById[id];
    };
    
    public getByName = function(name:string):IGrainType {
        return this._listMappedByName[name];
    };
}
