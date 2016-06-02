interface ISimpleAnswerCustomCopyData {
    filled_answer:string;
}

class SimpleAnswerCustomCopyData implements ISimpleAnswerCustomCopyData {

    filled_answer:string;

    constructor
    (
        filled_answer?:string
    )
    {
        this.filled_answer = filled_answer;
    }
}