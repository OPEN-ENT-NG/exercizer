interface ISubject {
    id:number;
    folder_id:number;
    original_subject_id:number;
    owner:string;
    created:string;
    modified:string;
    title:string;
    description:string;
    picture:string;
    max_score:number;
    is_library_subject:boolean;
    is_deleted:boolean;
}

class Subject implements ISubject {

    id:number;
    folder_id:number;
    original_subject_id:number;
    owner:string;
    created:string;
    modified:string;
    title:string;
    description:string;
    picture:string;
    max_score:number;
    is_library_subject:boolean;
    is_deleted:boolean;

    constructor
    (
        id?:number,
        folder_id?:number,
        original_subject_id?:number,
        owner?:string,
        created?:string,
        modified?:string,
        title?:string,
        description?:string,
        picture?:string,
        max_score?:number,
        is_library_subject?:boolean,
        is_deleted?:boolean
    )
    {
        this.id = id;
        this.folder_id = folder_id;
        this.original_subject_id = original_subject_id;
        this.owner = owner;
        this.created = created;
        this.modified = modified;
        this.title = title;
        this.description = description;
        this.picture = picture;
        this.max_score = max_score;
        this.is_library_subject = is_library_subject;
        this.is_deleted = is_deleted;
    }
}