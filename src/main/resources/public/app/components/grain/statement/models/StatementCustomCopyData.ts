interface IStatementCustomCopyData {
    statement:string;
}

class StatementCustomCopyData implements IStatementCustomCopyData {

    statement:string;

    constructor
    (
        statement?:string
    )
    {
        this.statement = statement;
    }
}