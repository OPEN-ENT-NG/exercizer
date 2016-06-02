interface IQcmCustomCopyData {
    filled_answer_list:any[];
}

class QcmCustomCopyData implements IQcmCustomCopyData {

    filled_answer_list:any[];

    constructor
    (
        filled_answer_list?:any[]
    )
    {
        this.filled_answer_list = filled_answer_list || [];
    }
}