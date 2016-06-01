interface IMultipleAnswerCustomData {
    correct_answer_list:any[];
    no_error_allowed : boolean;
}

class MultipleAnswerCustomData implements IMultipleAnswerCustomData {

    private _correct_answer_list:any[];
    private _no_error_allowed : boolean;

    constructor
    (
        correct_answer_list?:any[],
        no_error_allowed?:boolean
    )
    {
        this._correct_answer_list = correct_answer_list || [];
        this._no_error_allowed = no_error_allowed || false;
    }

    get correct_answer_list():any[] {
        return this._correct_answer_list;
    }

    set correct_answer_list(value:any[]) {
        this._correct_answer_list = value;
    }


    get no_error_allowed():boolean {
        return this._no_error_allowed;
    }

    set no_error_allowed(value:boolean) {
        this._no_error_allowed = value;
    }
}