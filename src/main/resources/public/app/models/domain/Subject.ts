interface ISubject {
    id:number;
    folder_id:number;
    original_subject_id:number;
    owner:string;
    owner_username:string;
    created:string;
    modified:string;
    title:string;
    description:string;
    picture:string;
    max_score:number;
    authors_contributors:string;
    is_library_subject:boolean;
    is_deleted:boolean;
    type:string;
}

class Subject implements ISubject {

    id:number;
    folder_id:number;
    original_subject_id:number;
    owner:string;
    owner_username:string;
    created:string;
    modified:string;
    title:string;
    description:string;
    picture:string;
    max_score:number;
    authors_contributors:string;
    is_library_subject:boolean;
    is_deleted:boolean;
    type:string;

    constructor
    (
        id?:number,
        folder_id?:number,
        original_subject_id?:number,
        owner?:string,
        owner_username?:string,
        created?:string,
        modified?:string,
        title?:string,
        description?:string,
        picture?:string,
        max_score?:number,
        authors_contributors?:string,
        is_library_subject?:boolean,
        is_deleted?:boolean,
        type?:string
    )
    {
        this.id = id;
        this.folder_id = folder_id;
        this.original_subject_id = original_subject_id;
        this.owner = owner;
        this.owner_username = owner_username;
        this.created = created;
        this.modified = modified;
        this.title = title;
        this.description = description;
        this.picture = picture;
        this.max_score = max_score;
        this.authors_contributors = authors_contributors;
        this.is_library_subject = is_library_subject;
        this.is_deleted = is_deleted;
        this.type = type;
    }
}