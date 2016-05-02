/**
 * Created by Erwan_LP on 29/04/2016.
 */
interface ISubject {
    id: number;
    owner: string;
    created : string;
    modified : string;
    visibility : string;
    folder_id : number;
    original_subject_id : number;
    title : string;
    description : string;
    picture : string;
    is_library_subject : boolean;
    is_deleted : boolean;
}