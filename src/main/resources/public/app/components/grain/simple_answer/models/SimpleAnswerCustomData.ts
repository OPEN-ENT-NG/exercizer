interface ISimpleAnswerCustomData {
    correct_answer:string;
}

class SimpleAnswerCustomData implements ISimpleAnswerCustomData {

    correct_answer:string;

    constructor
    (
        correct_answer?:string
    )
    {
        this.correct_answer = correct_answer;
    }
}