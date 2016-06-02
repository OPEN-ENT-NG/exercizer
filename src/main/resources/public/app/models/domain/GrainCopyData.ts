interface IGrainCopyData {
    title:string;
    max_score:number;
    statement:string;
    document_list:IGrainDocument[];
    answer_hint:string;
    custom_copy_data:any;
}

class GrainCopyData implements IGrainCopyData {

    title:string;
    max_score:number;
    statement:string;
    document_list:IGrainDocument[];
    answer_hint:string;
    custom_copy_data:any;

    constructor
    (
        title?:string,
        max_score?:number,
        statement?:string,
        document_list?:IGrainDocument[],
        answer_hint?:string,
        custom_copy_data?:any
    )
    {
        this.title = title;
        this.max_score = max_score;
        this.statement = statement;
        this.document_list = document_list;
        this.answer_hint = answer_hint;
        this.custom_copy_data = custom_copy_data;
    }
}
