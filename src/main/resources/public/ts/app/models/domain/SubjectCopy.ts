import { EditTrackingEvent, trackingService } from "entcore";
import { ISubjectCopyFile } from "./SubjectCopyFile";

export interface ISubjectCopy {
    id:number;
    subject_scheduled_id:number;
    owner:string;
    owner_username:string;
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
    offset:number;
    is_training_copy:boolean;
    current_grain_id:number;
    modifiedDate?: Date;
    getTracker():EditTrackingEvent;
    corrected_files: Array<ISubjectCopyFile>;
    homework_files: Array<ISubjectCopyFile>;
}

export class SubjectCopy implements  ISubjectCopy {

    id:number;
    subject_scheduled_id:number;
    owner:string;
    owner_username:string;
    created:string;
    modified:string;
    final_score:number;
    calculated_score:number;
    comment:string;
    has_been_started:boolean;
    submitted_date:string;
    is_correction_on_going:boolean;
    is_corrected:boolean;
    is_deleted: boolean;
    offset:number;
    is_training_copy:boolean;
    current_grain_id:number;
    dueDate: string;
    tracker: EditTrackingEvent;
    corrected_file_id?:string
    corrected_files: Array<ISubjectCopyFile> = [];
    homework_files: Array<ISubjectCopyFile> = [];

    toJSON(){
        return {
            id: this.id,
            subject_scheduled_id: this.subject_scheduled_id,
            owner: this.owner,
            owner_username: this.owner_username,
            created: this.created,
            modified: this.modified,
            final_score: this.final_score,
            calculated_score: this.calculated_score,
            comment: this.comment,
            has_been_started: this.has_been_started,
            submitted_date: this.submitted_date,
            is_correction_on_going: this.is_correction_on_going,
            is_corrected: this.is_corrected,
            is_deleted: this.is_deleted,
            offset: this.offset,
            is_training_copy: this.is_training_copy,
            current_grain_id: this.current_grain_id
        }
    }

    fromJSON(o){
        Object.assign(this, o);
        if( o.files ) {
            o.files && o.files.forEach( f => {
                switch( f.file_type ) {
                    case "corrected": this.corrected_files.push( f ); break;
                    case "homework": this.homework_files.push( f ); break;
                    default: break; // Discard this file, having an unknown type.
                }
            });
        }
    }

    constructor
    (
        id?:number,
        subject_scheduled_id?:number,
        owner?:string,
        owner_username?:string,
        created?:string,
        modified?:string,
        final_score?:number,
        calculated_score?:number,
        comment?:string,
        has_been_started?:boolean,
        submitted_date?:string,
        is_correction_on_going?:boolean,
        is_corrected?:boolean,
        is_deleted?:boolean,
        is_training_copy?:boolean,
        current_grain_id?:number
    )
    {
        this.id = id;
        this.subject_scheduled_id = subject_scheduled_id;
        this.owner = owner;
        this.owner_username = owner_username;
        this.created = created;
        this.modified = modified;
        this.final_score = final_score;
        this.calculated_score = calculated_score;
        this.comment = comment;
        this.has_been_started = has_been_started;
        this.submitted_date = submitted_date;
        this.is_correction_on_going = is_correction_on_going;
        this.is_corrected = is_corrected;
        this.is_deleted = is_deleted;
        this.is_training_copy = is_training_copy;
        this.current_grain_id = current_grain_id;
        this.corrected_files = [];
        this.homework_files = [];
    }
    
    getTracker():EditTrackingEvent{
        if(!this.tracker){
            const id = this.id? this.id+'' : null;
            this.tracker = trackingService.trackEdition({resourceId:id,resourceUri:`/exercizer/subject-copy/simple/${id || 'new'}`})
        }
        return this.tracker;
    }
}