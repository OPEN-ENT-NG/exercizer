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
    _homework_metadata: any;

    set homework_metadata(thing){

        if(typeof(thing) === 'string'){
            this._homework_metadata = JSON.parse(thing);
        }
        else{
            this._homework_metadata = thing;
        }

    }

    get homework_metadata(){
        return this._homework_metadata;
    }

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
    }
}