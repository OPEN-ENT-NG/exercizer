interface IFolder {
    id:number;
    created:string;
    modified:string;
    folder_id:number;
    label:string;
}

class Folder implements IFolder {

    private _id:number;
    private _created:string;
    private _modified:string;
    private _folder_id:number;
    private _label:string;
    
    constructor
    (
        id?:number,
        created?:string,
        modified?:string,
        folder_id?:number,
        label?:string
    )
    {
        this._id = id;
        this._created = created;
        this._modified = modified;
        this._folder_id = folder_id;
        this._label = label;
    }

    get id():number {
        return this._id;
    }

    set id(value:number) {
        this._id = value;
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

    get folder_id():number {
        return this._folder_id;
    }

    set folder_id(value:number) {
        this._folder_id = value;
    }

    get label():string {
        return this._label;
    }

    set label(value:string) {
        this._label = value;
    }
}
