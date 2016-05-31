interface IAssociationCustomData {
    correct_answer_list:any[];
    no_error_allowed : boolean;
    show_left_column : boolean;
}

class AssociationCustomData implements IAssociationCustomData {

    private _correct_answer_list:any[];
    private _no_error_allowed : boolean;
    private _show_left_column : boolean;

    constructor
    (
        correct_answer_list?:any[],
        no_error_allowed?:boolean,
        show_left_column? : boolean
    )
    {
        this._correct_answer_list = correct_answer_list || [];
        this._no_error_allowed = no_error_allowed || false;
        this._show_left_column = show_left_column ||true;
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


    get show_left_column():boolean {
        return this._show_left_column;
    }

    set show_left_column(value:boolean) {
        this._show_left_column = value;
    }
}