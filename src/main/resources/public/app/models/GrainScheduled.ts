/**
 * Created by Erwan_LP on 29/04/2016.
 */
interface IGrainScheduled {
    id: number;
    subject_scheduled_id : number;
    grain_type_id : number;
    parent_grain_id : number;
    next_grain_id : number;
    previous_grain_id : number;
    created : string;
    grain_data : IGrainData;
    is_deleted : boolean;
}