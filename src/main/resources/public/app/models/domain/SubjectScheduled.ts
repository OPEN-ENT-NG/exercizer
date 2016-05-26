interface ISubjectScheduled {
    id:number;
    subject_id:number;
    owner:string;
    created:string;
    title:string;
    description:string;
    picture:string;
    max_score:number;
    begin_date:string;
    due_date:string;
    estimated_duration:string;
    is_over:boolean;
    is_one_shot_submit:boolean;
    is_deleted:boolean;
}

class SubjectScheduled implements ISubjectScheduled {

    private _id:number;
    private _subject_id:number;
    private _owner:string;
    private _created:string;
    private _title:string;
    private _description:string;
    private _picture:string;
    private _max_score:number;
    private _begin_date:string;
    private _due_date:string;
    private _estimated_duration:string;
    private _is_over:boolean;
    private _is_one_shot_submit:boolean;
    private _is_deleted:boolean;
    
    constructor
    (
        id?:number,
        subject_id?:number,
        owner?:string,
        created?:string,
        title?:string,
        description?:string,
        picture?:string,
        max_score?:number,
        begin_date?:string,
        due_date?:string,
        estimated_duration?:string,
        is_over?:boolean,
        is_one_shot_submit?:boolean,
        is_deleted?:boolean
    )
    {
        this._id = id;
        this._subject_id = subject_id;
        this._owner = owner;
        this._created = created;
        this._title = title;
        this._description = description;
        this._picture = picture;
        this._max_score = max_score;
        this._begin_date = begin_date;
        this._due_date = due_date;
        this._estimated_duration = estimated_duration;
        this._is_over = is_over;
        this._is_one_shot_submit = is_one_shot_submit;
        this._is_deleted = is_deleted;
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

    get title():string {
        return this._title;
    }

    set title(value:string) {
        this._title = value;
    }

    get description():string {
        return this._description;
    }

    set description(value:string) {
        this._description = value;
    }

    get picture():string {
        return this._picture;
    }

    set picture(value:string) {
        this._picture = value;
    }

    get max_score():number {
        return this._max_score;
    }

    set max_score(value:number) {
        this._max_score = value;
    }

    get begin_date():string {
        return this._begin_date;
    }

    set begin_date(value:string) {
        this._begin_date = value;
    }

    get due_date():string {
        return this._due_date;
    }

    set due_date(value:string) {
        this._due_date = value;
    }

    get estimated_duration():string {
        return this._estimated_duration;
    }

    set estimated_duration(value:string) {
        this._estimated_duration = value;
    }

    get is_over():boolean {
        return this._is_over;
    }

    set is_over(value:boolean) {
        this._is_over = value;
    }

    get is_one_shot_submit():boolean {
        return this._is_one_shot_submit;
    }

    set is_one_shot_submit(value:boolean) {
        this._is_one_shot_submit = value;
    }

    get is_deleted():boolean {
        return this._is_deleted;
    }

    set is_deleted(value:boolean) {
        this._is_deleted = value;
    }
}