interface IOrderCustomCopyData {
    filled_answer_list:any[];
}

class OrderCustomCopyData implements IOrderCustomCopyData {

    filled_answer_list:any[];

    constructor
    (
        filled_answer_list?:any[]
    )
    {
        this.filled_answer_list = filled_answer_list || [];
    }
}