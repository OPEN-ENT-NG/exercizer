/**
 * Created by Erwan_LP on 29/04/2016.
 */
interface ISubjectCopy {
    id: number;
    subject_scheduled_id : number;
    owner : string;
    created : string;
    modified : string;
    final_score : number;
    calculated_score : number;
    teacher_comment : string;
    has_been_submitted : boolean;
    is_deleted : boolean;
}