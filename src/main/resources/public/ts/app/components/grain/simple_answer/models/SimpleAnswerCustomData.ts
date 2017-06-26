export interface ISimpleAnswerCustomData {
    correct_answer:string;
}

export class SimpleAnswerCustomData implements ISimpleAnswerCustomData {

    correct_answer:string;

    constructor
    (
        correct_answer?:string
    )
    {
        this.correct_answer = correct_answer;
    }
}