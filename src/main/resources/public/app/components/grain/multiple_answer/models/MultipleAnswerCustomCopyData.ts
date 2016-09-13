interface IMultipleAnswerCustomCopyData {
    filled_answer_list:any[];
    no_error_allowed:boolean;
}

class MultipleAnswerCustomCopyData implements IMultipleAnswerCustomCopyData {

    filled_answer_list:any[];
    no_error_allowed:boolean;

    constructor
    (
        filled_answer_list?:any[],
        no_error_allowed?:boolean
    )
    {
        this.filled_answer_list = filled_answer_list || [];
        this.no_error_allowed = no_error_allowed || false;
    }
}