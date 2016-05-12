interface ISubjectScheduled {
    id: number;
    subject_id : number;
    created : string;
    title : string;
    max_score : number;
    description : string;
    picture : string;
    begin_date :string;
    due_date : string;
    note_published_date : string;
    duration : string;
    is_over : boolean;
    is_one_shot_submit : boolean;
    has_to_randomized : boolean
    is_deleted : boolean;
}