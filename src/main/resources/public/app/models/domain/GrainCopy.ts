interface IGrainCopy {
    id:number;
    subject_copy_id:number;
    grain_type_id:number;
    grain_scheduled_id:number;
    created:string;
    modified:string;
    order_by:number;
    final_score:number;
    calculated_score:number;
    comment:string;
    grain_copy_data:IGrainCopyData;
}

class GrainCopy implements IGrainCopy {

    private _id:number;
    private _subject_copy_id:number;
    private _grain_type_id:number;
    private _grain_scheduled_id:number;
    private _created:string;
    private _modified:string;
    private _order_by:number;
    private _final_score:number;
    private _calculated_score:number;
    private _comment:string;
    private _grain_copy_data:IGrainCopyData;


    constructor
    (
        id?:number, 
        subject_copy_id?:number, 
        grain_type_id?:number, 
        grain_scheduled_id?:number, 
        created?:string, 
        modified?:string, 
        order_by?:number, 
        final_score?:number, 
        calculated_score?:number, 
        comment?:string, 
        grain_copy_data?:IGrainCopyData
    ) 
    {
        this._id = id;
        this._subject_copy_id = subject_copy_id;
        this._grain_type_id = grain_type_id;
        this._grain_scheduled_id = grain_scheduled_id;
        this._created = created;
        this._modified = modified;
        this._order_by = order_by;
        this._final_score = final_score;
        this._calculated_score = calculated_score;
        this._comment = comment;
        this._grain_copy_data = grain_copy_data;
    }

    get id():number {
        return this._id;
    }

    set id(value:number) {
        this._id = value;
    }

    get subject_copy_id():number {
        return this._subject_copy_id;
    }

    set subject_copy_id(value:number) {
        this._subject_copy_id = value;
    }

    get grain_type_id():number {
        return this._grain_type_id;
    }

    set grain_type_id(value:number) {
        this._grain_type_id = value;
    }

    get grain_scheduled_id():number {
        return this._grain_scheduled_id;
    }

    set grain_scheduled_id(value:number) {
        this._grain_scheduled_id = value;
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

    get order_by():number {
        return this._order_by;
    }

    set order_by(value:number) {
        this._order_by = value;
    }

    get final_score():number {
        return this._final_score;
    }

    set final_score(value:number) {
        this._final_score = value;
    }

    get calculated_score():number {
        return this._calculated_score;
    }

    set calculated_score(value:number) {
        this._calculated_score = value;
    }

    get comment():string {
        return this._comment;
    }

    set comment(value:string) {
        this._comment = value;
    }

    get grain_copy_data():IGrainCopyData {
        return this._grain_copy_data;
    }

    set grain_copy_data(value:IGrainCopyData) {
        this._grain_copy_data = value;
    }
}