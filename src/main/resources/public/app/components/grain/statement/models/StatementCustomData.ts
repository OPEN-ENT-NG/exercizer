interface IStatementCustomData {
    statement:string;
}

class StatementCustomData implements IStatementCustomData {

    statement:string;
    
    constructor
    (
        statement?:string
    )
    {
        this.statement = statement;
    }
}