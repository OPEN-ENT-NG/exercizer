interface IGrainDocument {
    id:number;
    owner:string;
    ownerName:string;
    created:string;
    title:string;
    name:string;
    path:string;
}

class GrainDocument implements IGrainDocument {

    private _id:number;
    private _owner:string;
    private _ownerName:string;
    private _created:string;
    private _title:string;
    private _name:string;
    private _path:string;

    constructor
    (
        id?:number,
        owner?:string,
        ownerName?:string,
        created?:string,
        title?:string,
        name?:string,
        path?:string
    )
    {
        this._id = id;
        this._owner = owner;
        this._ownerName = ownerName;
        this._created = created;
        this._title = title;
        this._name = name;
        this._path = path;
    }

    get id():number {
        return this._id;
    }

    set id(value:number) {
        this._id = value;
    }

    get owner():string {
        return this._owner;
    }

    set owner(value:string) {
        this._owner = value;
    }

    get ownerName():string {
        return this._ownerName;
    }

    set ownerName(value:string) {
        this._ownerName = value;
    }

    get created():string {
        return this._created;
    }

    set created(value:string) {
        this._created = value;
    }

    get title():string {
        return this._title;
    }

    set title(value:string) {
        this._title = value;
    }

    get name():string {
        return this._name;
    }

    set name(value:string) {
        this._name = value;
    }

    get path():string {
        return this._path;
    }

    set path(value:string) {
        this._path = value;
    }
}