interface ISubject {
    id: number;
    owner: string;
    created : string;
    modified : string;
    visibility : string;
    folder_id : number;
    original_subject_id : number;
    max_score : number;
    title : string;
    description : string;
    picture : string;
    is_library_subject : boolean;
    is_deleted : boolean;
}