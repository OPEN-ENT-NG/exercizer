import { IGrainData } from './GrainData';

export interface IGrainScheduled {
    id:number;
    subject_scheduled_id:number;
    grain_type_id:number;
    created:string;
    order_by:number;
    grain_data:IGrainData;
}

export class GrainScheduled implements IGrainScheduled {

    id:number;
    subject_scheduled_id:number;
    grain_type_id:number;
    created:string;
    order_by:number;
    grain_data:IGrainData;

    constructor
    (
        id?:number,
        subject_scheduled_id?:number,
        grain_type_id?:number,
        order_by?:number,
        created?:string,
        grain_data?:IGrainData
    )
    {
        this.id = id;
        this.subject_scheduled_id = subject_scheduled_id;
        this.grain_type_id = grain_type_id;
        this.created = created;
        this.order_by = order_by;
        this.grain_data = grain_data;
    }

}