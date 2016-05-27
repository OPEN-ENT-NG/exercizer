interface IGrainScheduled {
    id:number;
    subject_scheduled_id:number;
    grain_type_id:number;
    grain_id:number;
    created:string;
    order:number;
    grain_data:IGrainData;
}

class GrainScheduled implements IGrainScheduled {

    private _id:number;
    private _subject_scheduled_id:number;
    private _grain_type_id:number;
    private _grain_id:number;
    private _created:string;
    private _order:number;
    private _grain_data:IGrainData;

    constructor
    (
        id?:number,
        subject_scheduled_id?:number,
        grain_type_id?:number,
        grain_id?:number,
        order?:number,
        created?:string,
        grain_data?:IGrainData
    )
    {
        this._id = id;
        this._subject_scheduled_id = subject_scheduled_id;
        this._grain_type_id = grain_type_id;
        this._grain_id = grain_id;
        this._created = created;
        this._order = order;
        this._grain_data = grain_data;
    }

    get id():number {
        return this._id;
    }

    set id(value:number) {
        this._id = value;
    }

    get subject_scheduled_id():number {
        return this._subject_scheduled_id;
    }

    set subject_scheduled_id(value:number) {
        this._subject_scheduled_id = value;
    }

    get grain_type_id():number {
        return this._grain_type_id;
    }

    set grain_type_id(value:number) {
        this._grain_type_id = value;
    }

    get grain_id():number {
        return this._grain_id;
    }

    set grain_id(value:number) {
        this._grain_id = value;
    }

    get created():string {
        return this._created;
    }

    set created(value:string) {
        this._created = value;
    }

    get order():number {
        return this._order;
    }

    set order(value:number) {
        this._order = value;
    }

    get grain_data():IGrainData {
        return this._grain_data;
    }

    set grain_data(value:IGrainData) {
        this._grain_data = value;
    }
}