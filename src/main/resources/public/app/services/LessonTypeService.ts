interface ILessonTypeService {
    resolve(): ng.IPromise<boolean>;
    getById(id:number): ILessonType;
    getLabel(id:number): ILessonType;
    getList(): ILessonType[];
}

class LessonTypeService implements ILessonTypeService {

    static $inject = [
        '$q',
        '$http'
    ];

    private _listMappedById: {[id:number]:ILessonType};

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

    public getById = function(id:number):ILessonType {
        return this._listMappedById[id];
    };

    public getLabel = function(id:number):string {
        return this._listMappedById[id].label;
    };

    public getList = function():ILessonType[] {
        return MapToListHelper.toList(this._listMappedById);
    };
}
