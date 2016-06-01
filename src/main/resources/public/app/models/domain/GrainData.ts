interface IGrainData {
    title:string;
    max_score:number;
    statement:string;
    document_list:IGrainDocument[];
    answer_hint:string;
    answer_explanation:string;
    custom_data:any;
}

class GrainData implements IGrainData {

    title:string;
    max_score:number;
    statement:string;
    document_list:IGrainDocument[];
    answer_hint:string;
    answer_explanation:string;
    custom_data:any;

    constructor
    (
        title?:string,
        max_score?:number,
        statement?:string,
        document_list?:IGrainDocument[],
        answer_hint?:string,
        answer_explanation?:string,
        custom_data?:any
    )
    {
        this.title = title;
        this.max_score = max_score;
        this.statement = statement;
        this.document_list = document_list;
        this.answer_hint = answer_hint;
        this.answer_explanation = answer_explanation;
        this.custom_data = custom_data;
    }
}