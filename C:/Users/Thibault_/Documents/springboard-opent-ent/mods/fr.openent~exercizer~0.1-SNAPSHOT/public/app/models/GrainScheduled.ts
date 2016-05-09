/**
 * Created by Erwan_LP on 29/04/2016.
 */
interface IGrainScheduled {
    id: number;
    subject_scheduled_id : number;
    grain_type_id : number;
    parent_grain_id : number;
    order : number;
    created : string;
    grain_data : IGrainData;
    is_deleted : boolean;
}