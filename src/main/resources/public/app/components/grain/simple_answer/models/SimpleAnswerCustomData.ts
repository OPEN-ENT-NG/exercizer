interface ISimpleAnswerCustomData {
    correct_answer:string;
}

class SimpleAnswerCustomData implements ISimpleAnswerCustomData {

    private _correct_answer:string;

    constructor
    (
        correct_answer?:string
    )
    {
        this._correct_answer = correct_answer;
    }

    get correct_answer():string {
        return this._correct_answer;
    }

    set correct_answer(value:string) {
        this._correct_answer = value;
    }
}