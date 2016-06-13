interface ISubjectScheduled {
    id:number;
    subject_id:number;
    owner:string;
    owner_username:string;
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
    has_automatic_display: boolean;
    is_deleted:boolean;
}

class SubjectScheduled implements ISubjectScheduled {

    id:number;
    subject_id:number;
    owner:string;
    owner_username:string;
    created:string;
    title:string;
    description:string;
    picture:string;
    max_score:number;
    begin_date:string;
    due_date:string;
    estimated_duration:string;
    is_over:boolean;
    has_automatic_display: boolean;
    is_one_shot_submit:boolean;
    is_deleted:boolean;
    
    constructor
    (
        id?:number,
        subject_id?:number,
        owner?:string,
        owner_username:string,
        created?:string,
        title?:string,
        description?:string,
        picture?:string,
        max_score?:number,
        begin_date?:string,
        due_date?:string,
        estimated_duration?:string,
        is_over?:boolean,
        has_automatic_display?:boolean,
        is_one_shot_submit?:boolean,
        is_deleted?:boolean
    )
    {
        this.id = id;
        this.subject_id = subject_id;
        this.owner = owner;
        this.owner_username = owner_username;
        this.created = created;
        this.title = title;
        this.description = description;
        this.picture = picture;
        this.max_score = max_score;
        this.begin_date = begin_date;
        this.due_date = due_date;
        this.estimated_duration = estimated_duration;
        this.is_over = is_over;
        this.has_automatic_display = has_automatic_display;
        this.is_one_shot_submit = is_one_shot_submit;
        this.is_deleted = is_deleted;
    }
}