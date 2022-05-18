export interface ISubjectScheduled {
    id:number;
    subject_id:number;
    owner:string;
    owner_username:string;
    created:string;
    modified: string;
    title:string;
    description:string;
    picture:string;
    max_score:number;
    begin_date:string;
    due_date:string;
    corrected_date:string;
    estimated_duration:string;
    is_over:boolean;
    is_one_shot_submit:boolean;
    random_display:boolean;
    has_automatic_display: boolean;
    is_deleted:boolean;
    scheduled_at : string[];
    type:string;
    is_training_mode: boolean;
    is_training_permitted: boolean;
}

export class SubjectScheduled implements ISubjectScheduled {

    id:number;
    subject_id:number;
    owner:string;
    owner_username:string;
    created:string;
    modified: string;
    title:string;
    description:string;
    picture:string;
    max_score:number;
    begin_date:string;
    due_date:string;
    corrected_date:string;
    estimated_duration:string;
    is_over:boolean;
    random_display:boolean;
    has_automatic_display: boolean;
    is_one_shot_submit:boolean;
    is_deleted:boolean;
    scheduled_at: string[];
    type:string;
    is_training_mode: boolean;
    is_training_permitted: boolean;
    
    constructor
    (
        id?:number,
        subject_id?:number,
        owner?:string,
        owner_username?:string,
        created?:string,
        modified?: string,
        title?:string,
        description?:string,
        picture?:string,
        max_score?:number,
        begin_date?:string,
        due_date?:string,
        corrected_date?:string,
        estimated_duration?:string,        
        is_over?:boolean,
        has_automatic_display?:boolean,
        random_display?:boolean,
        is_one_shot_submit?:boolean,
        is_deleted?:boolean,
        scheduled_at? : string[],
        type?:string,
        is_training_mode?: boolean,
        is_training_permitted?: boolean
    )
    {
        this.id = id;
        this.subject_id = subject_id;
        this.owner = owner;
        this.owner_username = owner_username;
        this.created = created;
        this.modified = modified;
        this.title = title;
        this.description = description;
        this.picture = picture;
        this.max_score = max_score;
        this.begin_date = begin_date;
        this.due_date = due_date;
        this.corrected_date = corrected_date;
        this.estimated_duration = estimated_duration;
        this.is_over = is_over;
        this.has_automatic_display = has_automatic_display;
        this.random_display = random_display;
        this.is_one_shot_submit = is_one_shot_submit;
        this.is_deleted = is_deleted;
        this.scheduled_at = scheduled_at || [];
        this.type = type;
        this.is_training_mode = is_training_mode;
        this.is_training_permitted = is_training_permitted;
    }
}