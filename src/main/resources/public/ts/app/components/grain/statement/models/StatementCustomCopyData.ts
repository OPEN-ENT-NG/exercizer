export interface IStatementCustomCopyData {
    statement:string;
}

export class StatementCustomCopyData implements IStatementCustomCopyData {

    statement: string;
    title: string;

    constructor(data?: StatementCustomCopyData) {
        if (data) {
            this.statement = data.statement;
            this.title = data.title;
        }
        
    }
}