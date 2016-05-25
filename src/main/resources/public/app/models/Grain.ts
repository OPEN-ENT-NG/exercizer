interface IGrain {
    id:number;
    subject_id:number;
    grain_type_id:number;
    order:number;
    original_grain_id:number;
    created:string;
    modified:string;
    grain_data:IGrainData;
}

class Grain implements IGrain {

    private _id:number;
    private _subject_id:number;
    private _grain_type_id:number;
    private _order:number;
    private _original_grain_id:number;
    private _created:string;
    private _modified:string;
    private _grain_data:IGrainData;

    constructor
    (
        id?:number,
        subject_id?:number,
        grain_type_id?:number,
        order?:number,
        original_grain_id?:number,
        created?:string,
        modified?:string,
        grain_data?:IGrainData
    )
    {
        this._id = id;
        this._subject_id = subject_id;
        this._grain_type_id = grain_type_id;
        this._order = order;
        this._original_grain_id = original_grain_id;
        this._created = created;
        this._modified = modified;
        this._grain_data = grain_data;
    }

    get id():number {
        return this._id;
    }

    set id(value:number) {
        this._id = value;
    }

    get subject_id():number {
        return this._subject_id;
    }

    set subject_id(value:number) {
        this._subject_id = value;
    }

    get grain_type_id():number {
        return this._grain_type_id;
    }

    set grain_type_id(value:number) {
        this._grain_type_id = value;
    }

    get order():number {
        return this._order;
    }

    set order(value:number) {
        this._order = value;
    }

    get original_grain_id():number {
        return this._original_grain_id;
    }

    set original_grain_id(value:number) {
        this._original_grain_id = value;
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

    get grain_data():IGrainData {
        return this._grain_data;
    }

    set grain_data(value:IGrainData) {
        this._grain_data = value;
    }
}