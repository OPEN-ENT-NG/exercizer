export interface IAssociationCustomCopyData {
    filled_answer_list:any[];
    possible_answer_list:any[];
    no_error_allowed:boolean;
    show_left_column:boolean;
}

export class AssociationCustomCopyData implements IAssociationCustomCopyData {

    filled_answer_list:any[];
    possible_answer_list: any[];
    no_error_allowed:boolean;
    show_left_column: boolean;

    constructor
    (
        filled_answer_list?:any[],
        possible_answer_list?:any[],
        no_error_allowed?:boolean,
        show_left_column?:boolean
    )
    {
        this.filled_answer_list = filled_answer_list || [];
        this.possible_answer_list = possible_answer_list || [];
        this.no_error_allowed = no_error_allowed || false;
        this.show_left_column = show_left_column !== false;
    }
}