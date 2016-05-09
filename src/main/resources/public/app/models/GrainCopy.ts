interface IGrainCopy {
    id: number;
    subject_copy_id : number;
    grain_scheduled_id : number;
    grain_type_id : number;
    created : string;
    modified : string;
    grain_copy_data : IGrainCopyData;
    final_score : number;
    score : number;
    teacher_comment : string;
    is_deleted : boolean;

}