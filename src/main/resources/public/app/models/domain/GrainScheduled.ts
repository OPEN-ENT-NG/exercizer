interface IGrainScheduled {
    id:number;
    subject_scheduled_id:number;
    grain_type_id:number;
    created:string;
    order_by:number;
    grain_data:IGrainData;
}

class GrainScheduled implements IGrainScheduled {

    private _id:number;
    private _subject_scheduled_id:number;
    private _grain_type_id:number;
    private _created:string;
    private _order_by:number;
    private _grain_data:IGrainData;

    constructor
    (
        id?:number,
        subject_scheduled_id?:number,
        grain_type_id?:number,
        order_by?:number,
        created?:string,
        grain_data?:IGrainData
    )
    {
        this._id = id;
        this._subject_scheduled_id = subject_scheduled_id;
        this._grain_type_id = grain_type_id;
        this._created = created;
        this._order_by = order_by;
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

    get created():string {
        return this._created;
    }

    set created(value:string) {
        this._created = value;
    }

    get order_by():number {
        return this._order_by;
    }

    set order_by(value:number) {
        this._order_by = value;
    }

    get grain_data():IGrainData {
        return this._grain_data;
    }

    set grain_data(value:IGrainData) {
        this._grain_data = value;
    }
}