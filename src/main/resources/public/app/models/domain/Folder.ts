interface IFolder {
    id:number;
    parent_folder_id:number;
    owner:string;
    created:string;
    modified:string;
    label:string;
}

class Folder implements IFolder {

    private _id:number;
    private _parent_folder_id:number;
    private _owner:string;
    private _created:string;
    private _modified:string;
    private _label:string;
    
    constructor
    (
        id?:number,
        parent_folder_id?:number,
        owner?:string,
        created?:string,
        modified?:string,
        label?:string
    )
    {
        this._id = id;
        this._parent_folder_id = parent_folder_id;
        this._owner = owner;
        this._created = created;
        this._modified = modified;
        this._label = label;
    }

    get id():number {
        return this._id;
    }

    set id(value:number) {
        this._id = value;
    }

    get parent_folder_id():number {
        return this._parent_folder_id;
    }

    set parent_folder_id(value:number) {
        this._parent_folder_id = value;
    }

    set owner(value:string) {
        this._owner = value;
    }

    get created():string {
        return this._created;
    }

    get created():string {
        return this._created;
    }

    set created(value:string) {
        this._created = value;
    }

    get modified():string {
        return this._modified;
    }

    set modified(value:string) {
        this._modified = value;
    }

    get label():string {
        return this._label;
    }

    set label(value:string) {
        this._label = value;
    }
}
