export interface IOpenAnswerCustomCopyData {
    filled_answer:string;
}

export class OpenAnswerCustomCopyData implements IOpenAnswerCustomCopyData {

    filled_answer:string;

    constructor
    (
        filled_answer?:string
    )
    {
        this.filled_answer = filled_answer;
    }
}