export interface IQcmCustomData {
    correct_answer_list:any[];
    no_error_allowed:boolean;
}

export class QcmCustomData implements IQcmCustomData {

    correct_answer_list:any[];
    multipleAnswers: boolean = false;
    no_error_allowed:boolean;

    constructor
    (
        correct_answer_list:any[] = [],
        no_error_allowed:boolean = false,
        multipleAnswers:boolean = false
    )
    {
        this.correct_answer_list = correct_answer_list;
        this.no_error_allowed = no_error_allowed;
        this.multipleAnswers = multipleAnswers;
    }
}