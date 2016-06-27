interface ISubjectTagService {
    resolve(): ng.IPromise<boolean>;
    persist(subjectTag:ISubjectTag): ng.IPromise<ISubjectTag>;
    getById(id:number): ISubjectTag;
    getLabel(id:number): ISubjectTag;
    getList(): ISubjectTag[];
}

class SubjectTagService implements ISubjectTagService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:ISubjectTag};

    constructor
    (
        private _$q:ng.IQService,
        private _$http:ng.IHttpService
    )
    {
        this._$q = _$q;
        this._$http = _$http;
    }

    public resolve = function():ng.IPromise<boolean> {
        // TODO
    };

    public persist = function():ng.IPromise<ISubjectTag> {
        // TODO
    };

    public getById = function(id:number):ISubjectTag {
        return this._listMappedById[id];
    };

    public getLabel = function(id:number):string {
        return this._listMappedById[id].label;
    };

    public getList = function():ISubjectTag[] {
        return MapToListHelper.toList(this._listMappedById);
    };
}

