import { EditTrackingEvent, trackingService } from 'entcore';
import { IGrainCopyData } from './GrainCopyData';

export interface IGrainCopy {
    id:number;
    subject_copy_id:number;
    grain_type_id:number;
    grain_scheduled_id:number;
    created:string;
    modified:string;
    order_by:number;
    display_order:number;
    final_score:number;
    calculated_score:number;
    comment:string;
    grain_copy_data:IGrainCopyData;
    getTracker(): EditTrackingEvent;
}

export class GrainCopy implements IGrainCopy {

    id:number;
    subject_copy_id:number;
    grain_type_id:number;
    grain_scheduled_id:number;
    created:string;
    modified:string;
    order_by:number;
    display_order:number;
    final_score:number;
    calculated_score:number;
    comment:string;
    grain_copy_data:IGrainCopyData;
    tracker?: EditTrackingEvent;


    constructor
    (
        id?:number, 
        subject_copy_id?:number, 
        grain_type_id?:number, 
        grain_scheduled_id?:number, 
        created?:string, 
        modified?:string, 
        order_by?:number, 
        display_order?:number, 
        final_score?:number, 
        calculated_score?:number, 
        comment?:string, 
        grain_copy_data?:IGrainCopyData
    ) 
    {
        this.id = id;
        this.subject_copy_id = subject_copy_id;
        this.grain_type_id = grain_type_id;
        this.grain_scheduled_id = grain_scheduled_id;
        this.created = created;
        this.modified = modified;
        this.order_by = order_by;
        this.display_order = display_order;
        this.final_score = final_score;
        this.calculated_score = calculated_score;
        this.comment = comment;
        this.grain_copy_data = grain_copy_data;
    }

    getTracker():EditTrackingEvent{
        if(!this.tracker){
            const id = this.id? this.id+'':null;
            this.tracker = trackingService.trackEdition({resourceId:id, resourceUri:`/exercizer/${this.subject_copy_id}/grain-copy/${this.id}`})
        }
        return this.tracker;
    }
}