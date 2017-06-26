export interface IQcmCustomData {
    correct_answer_list:any[];
    no_error_allowed:boolean;
}

export class QcmCustomData implements IQcmCustomData {

    correct_answer_list:any[];
    no_error_allowed:boolean;

    constructor
    (
        correct_answer_list?:any[],
        no_error_allowed?:boolean
    )
    {
        this.correct_answer_list = correct_answer_list || [];
        this.no_error_allowed = no_error_allowed || false;
    }
}