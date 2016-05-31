interface IOrderCustomData {
    correct_answer_list:any[];
}

class OrderCustomData implements IOrderCustomData {

    private _correct_answer_list:any[];

    constructor
    (
        correct_answer_list?:any[]
    )
    {
        this._correct_answer_list = correct_answer_list || [];
    }

    get correct_answer_list():any[] {
        return this._correct_answer_list;
    }

    set correct_answer_list(value:any[]) {
        this._correct_answer_list = value;
    }
}