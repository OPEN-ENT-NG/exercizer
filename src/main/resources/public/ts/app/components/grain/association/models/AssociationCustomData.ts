export interface IAssociationCustomData {
    correct_answer_list:any[];
    no_error_allowed:boolean;
    show_left_column:boolean;
}

export class AssociationCustomData implements IAssociationCustomData {

    correct_answer_list:any[];
    no_error_allowed:boolean;
    show_left_column:boolean;

    constructor
    (
        correct_answer_list?:any[],
        no_error_allowed?:boolean,
        show_left_column?:boolean
    )
    {
        this.correct_answer_list = correct_answer_list || [];
        this.no_error_allowed = no_error_allowed || false;
        this.show_left_column = show_left_column || true;
    }
}