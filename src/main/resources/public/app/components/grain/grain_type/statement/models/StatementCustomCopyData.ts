interface IStatementCustomCopyData {
    statement : string;
}

class StatementCustomCopyData implements  IStatementCustomCopyData {

    private _statement:string;

    constructor
    (
        statement?:string
    )
    {
        this._statement = statement;
    }


    get statement():string {
        return this._statement;
    }

    set statement(value:string) {
        this._statement = value;
    }
}