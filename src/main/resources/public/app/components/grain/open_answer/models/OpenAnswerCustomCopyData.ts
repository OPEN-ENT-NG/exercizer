interface IOpenAnswerCustomCopyData {
    filled_answer:string;
}

class OpenAnswerCustomCopyData implements IOpenAnswerCustomCopyData {

    private _filled_answer:string;

    constructor
    (
        filled_answer?:string
    )
    {
        this._filled_answer = filled_answer;
    }

    get filled_answer():string {
        return this._filled_answer;
    }

    set filled_answer(value:string) {
        this._filled_answer = value;
    }
}