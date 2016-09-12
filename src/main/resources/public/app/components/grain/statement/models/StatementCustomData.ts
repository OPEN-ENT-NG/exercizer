interface IStatementCustomData {
    statement:string;
}

class StatementCustomData implements IStatementCustomData {

    statement: string;
    title: string;
    
    constructor(data?: StatementCustomData)
    {
        if (data) {
            this.statement = data.statement;
            this.title = data.title;
        }
    }
}