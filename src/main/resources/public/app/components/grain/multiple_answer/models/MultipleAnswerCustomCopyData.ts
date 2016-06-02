interface IMultipleAnswerCustomCopyData {
    filled_answer_list:any[];
}

class MultipleAnswerCustomCopyData implements IMultipleAnswerCustomCopyData {

    filled_answer_list:any[];

    constructor
    (
        filled_answer_list?:any[]
    )
    {
        this.filled_answer_list = filled_answer_list || [];
    }
}