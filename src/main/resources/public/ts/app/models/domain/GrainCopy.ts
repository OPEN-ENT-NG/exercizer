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
}