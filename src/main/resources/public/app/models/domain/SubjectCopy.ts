interface ISubjectCopy {
    id:number;
    subject_scheduled_id:number;
    owner:string;
    created:string;
    modified:string;
    final_score:number;
    calculated_score:number;
    comment:string;
    has_been_submitted:boolean;
    is_deleted:boolean;
}

class SubjectCopy implements  ISubjectCopy {

    private _id:number;
    private _subject_scheduled_id:number;
    private _owner:string;
    private _created:string;
    private _modified:string;
    private _final_score:number;
    private _calculated_score:number;
    private _comment:string;
    private _has_been_submitted:boolean;
    private _is_deleted:boolean;
    
    constructor
    (
        id?:number,
        subject_scheduled_id?:number,
        owner?:string,
        created?:string,
        modified?:string,
        final_score?:number,
        calculated_score?:number,
        comment?:string,
        has_been_submitted?:boolean,
        is_deleted?:boolean
    )
    {
        this._id = id;
        this._subject_scheduled_id = subject_scheduled_id;
        this._owner = owner;
        this._created = created;
        this._modified = modified;
        this._final_score = final_score;
        this._calculated_score = calculated_score;
        this. _comment = comment;
        this._has_been_submitted = has_been_submitted;
        this._is_deleted = is_deleted;
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

    get owner():string {
        return this._owner;
    }

    set owner(value:string) {
        this._owner = value;
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

    get has_been_submitted():boolean {
        return this._has_been_submitted;
    }

    set has_been_submitted(value:boolean) {
        this._has_been_submitted = value;
    }

    get is_deleted():boolean {
        return this._is_deleted;
    }

    set is_deleted(value:boolean) {
        this._is_deleted = value;
    }
}