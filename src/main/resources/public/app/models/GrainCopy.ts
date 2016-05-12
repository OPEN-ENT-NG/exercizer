interface IGrainCopy {
    id: number;
    subject_copy_id : number;
    grain_scheduled_id : number;
    grain_type_id : number;
    order : number;
    created : string;
    modified : string;
    grain_copy_data : IGrainCopyData;
    final_score : number;
    calculated_score : number;
    teacher_comment : string;
    is_deleted : boolean;

}