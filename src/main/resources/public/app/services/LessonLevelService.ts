interface ILessonLevelService {
    resolve(): ng.IPromise<boolean>;
    getById(id:number): ILessonLevel;
    getLabel(id:number): ILessonLevel;
    getList(): ILessonLevel[];
}

class LessonLevelService implements ILessonLevelService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:ILessonLevel};

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

    public getById = function(id:number):ILessonLevel {
        return this._listMappedById[id];
    };

    public getLabel = function(id:number):string {
        return this._listMappedById[id].label;
    };

    public getList = function():ILessonLevel[] {
        return MapToListHelper.toList(this._listMappedById);
    };
}
