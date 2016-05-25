interface ISubject {
    id:number;
    owner:string;
    created:string;
    modified:string;
    visibility:string;
    folder_id:number;
    original_subject_id:number;
    max_score:number;
    title:string;
    description:string;
    picture:string;
    is_library_subject:boolean;
    is_deleted:boolean;
}

class Subject implements ISubject {

    private _id:number;
    private _owner:string;
    private _created:string;
    private _modified:string;
    private _visibility:string;
    private _folder_id:number;
    private _original_subject_id:number;
    private _max_score:number;
    private _title:string;
    private _description:string;
    private _picture:string;
    private _is_library_subject:boolean;
    private _is_deleted:boolean;

    constructor
    (
        id?:number,
        owner?:string,
        created?:string,
        modified?:string,
        visibility?:string,
        folder_id?:number,
        original_subject_id?:number,
        max_score?:number,
        title?:string,
        description?:string,
        picture?:string,
        is_library_subject?:boolean,
        is_deleted?:boolean
    )
    {
        this._id = id;
        this._owner = owner;
        this._created = created;
        this._modified = modified;
        this._visibility = visibility;
        this._folder_id = folder_id;
        this._original_subject_id = original_subject_id;
        this._max_score = max_score;
        this._title = title;
        this._description = description;
        this._picture = picture;
        this._is_library_subject = is_library_subject;
        this._is_deleted = is_deleted;
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

    get visibility():string {
        return this._visibility;
    }

    set visibility(value:string) {
        this._visibility = value;
    }

    get folder_id():number {
        return this._folder_id;
    }

    set folder_id(value:number) {
        this._folder_id = value;
    }

    get original_subject_id():number {
        return this._original_subject_id;
    }

    set original_subject_id(value:number) {
        this._original_subject_id = value;
    }

    get max_score():number {
        return this._max_score;
    }

    set max_score(value:number) {
        this._max_score = value;
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

    get is_library_subject():boolean {
        return this._is_library_subject;
    }

    set is_library_subject(value:boolean) {
        this._is_library_subject = value;
    }

    get is_deleted():boolean {
        return this._is_deleted;
    }

    set is_deleted(value:boolean) {
        this._is_deleted = value;
    }
}