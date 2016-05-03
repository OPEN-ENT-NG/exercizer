/**
 * Created by Erwan_LP on 29/04/2016.
 */
interface IGrain {
    id: number;
    subject_id : number;
    grain_type_id : number;
    order : number;
    original_grain_id : number;
    created : string;
    modified : string;
    grain_data : any;
    is_library_grain : boolean;
}