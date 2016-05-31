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
        
        grainTypeList.push(new GrainType(1, 'choose', 'Ajouter...', undefined, false));
        grainTypeList.push(new GrainType(2, 'chooseAnswer', 'Choisir un type de question...', undefined, false));
        grainTypeList.push(new GrainType(3, 'statement', 'Énoncé', 'doc-text', false));
        grainTypeList.push(new GrainType(4, 'simple_answer', 'Réponse simple', 'simple', true));
        grainTypeList.push(new GrainType(5, 'open_answer', 'Réponse ouverte', 'ouverte', true));
        grainTypeList.push(new GrainType(6, 'multiple_answers', 'Réponses multiples', 'multiple', true));
        grainTypeList.push(new GrainType(7, 'qcm', 'QCM', 'qcm', true));
        grainTypeList.push(new GrainType(8, 'association', 'Association', 'association', true));
        grainTypeList.push(new GrainType(9, 'order_by', 'Mise en ordre', 'ordre', true));
        grainTypeList.push(new GrainType(10, 'text_to_fill', 'Texte à trous', 'textetrous', true));
        grainTypeList.push(new GrainType(11, 'area_select', 'Zone à remplir', 'zoneselect', true));
        
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
