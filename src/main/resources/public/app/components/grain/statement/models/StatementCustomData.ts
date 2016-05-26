interface IStatementCustomData {
    statement:string;
}

class StatementCustomData implements IStatementCustomData {
    
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