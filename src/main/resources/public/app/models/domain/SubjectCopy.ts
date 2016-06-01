interface ISubjectCopy {
    id:number;
    subject_scheduled_id:number;
    owner:string;
    created:string;
    modified:string;
    final_score:number;
    calculated_score:number;
    comment:string;
    has_been_started:boolean;
    submitted_date:string;
    is_correction_on_going:boolean;
    is_corrected:boolean;
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
    private _has_been_started:boolean;
    private _submitted_date:string;
    private _is_correction_on_going:boolean;
    private _is_corrected:boolean;
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
        has_been_started?:boolean,
        submitted_date?:string,
        is_correction_on_going?:boolean,
        is_corrected?:boolean,
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
        this._comment = comment;
        this._has_been_started = has_been_started;
        this._submitted_date = submitted_date;
        this._is_correction_on_going = is_correction_on_going;
        this._is_corrected = is_corrected;
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

    get has_been_started():boolean {
        return this._has_been_started;
    }

    set has_been_started(value:boolean) {
        this._has_been_started = value;
    }

    get submitted_date():string {
        return this._submitted_date;
    }

    set submitted_date(value:string) {
        this._submitted_date = value;
    }

    get is_correction_on_going():boolean {
        return this._is_correction_on_going;
    }

    set is_correction_on_going(value:boolean) {
        this._is_correction_on_going = value;
    }

    get is_corrected():boolean {
        return this._is_corrected;
    }

    set is_corrected(value:boolean) {
        this._is_corrected = value;
    }

    get is_deleted():boolean {
        return this._is_deleted;
    }

    set is_deleted(value:boolean) {
        this._is_deleted = value;
    }
}