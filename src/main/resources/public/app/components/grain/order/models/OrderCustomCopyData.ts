interface IOrderCustomCopyData {
    filled_answer_list:string;
}

class OrderCustomCopyData implements IOrderCustomCopyData {

    private _filled_answer_list:string;

    constructor
    (
        filled_answer_list?:string
    )
    {
        this._filled_answer_list = filled_answer_list || [];
    }

    get filled_answer_list():string {
        return this._filled_answer_list;
    }

    set filled_answer_list(value:string) {
        this._filled_answer_list = value;
    }
}