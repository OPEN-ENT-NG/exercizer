interface IAssociationCustomCopyData {
    filled_answer_list:any[];
    possible_answer_list:any[];
    show_left_column:boolean;
}

class AssociationCustomCopyData implements IAssociationCustomCopyData {

    filled_answer_list:any[];
    possible_answer_list: any[];
    show_left_column: boolean;

    constructor
    (
        filled_answer_list?:any[],
        possible_answer_list?:any[],
        show_left_column?:boolean
    )
    {
        this.filled_answer_list = filled_answer_list || [];
        this.possible_answer_list = possible_answer_list || [];
        this.show_left_column = show_left_column !== false;
    }
}