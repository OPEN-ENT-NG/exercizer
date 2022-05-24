import { EditTrackingEvent, trackingService } from "entcore";
import { ISubjectDocument } from "./SubjectDocument";

export interface ISubject {
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
    selected:boolean;
    getTracker():EditTrackingEvent;
    files: Array<ISubjectDocument>;
}

export class Subject implements ISubject {

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
    selected: boolean;
    tracker: EditTrackingEvent;
    files: Array<ISubjectDocument> = [];

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
        type?:string,
        selected?:boolean
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
        this.selected = selected;
    }
    
    getTracker():EditTrackingEvent{
        if(!this.tracker){
            const id = this.id? this.id+'' : null;
            this.tracker = trackingService.trackEdition({resourceId:id,resourceUri:`/exercizer/subject/simple/${id || 'new'}`})
        }
        return this.tracker;
    }
}