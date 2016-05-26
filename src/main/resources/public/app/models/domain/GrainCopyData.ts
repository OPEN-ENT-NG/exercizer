interface IGrainCopyData {
    title:string,
    max_score:number,
    statement:string,
    document_list:IGrainDocument[];
    hint:string,
    custom_copy_data:any;
}

class GrainCopyData implements IGrainCopyData {

    private _title:string;
    private _max_score:number;
    private _statement:string;
    private _document_list:IGrainDocument[];
    private _hint:string;
    private _custom_copy_data:any;

    constructor
    (
        title?:string,
        max_score?:number,
        statement?:string,
        document_list?:IGrainDocument[],
        hint?:string,
        custom_copy_data?:any
    )
    {
        this._title = title;
        this._max_score = max_score;
        this._statement = statement;
        this._document_list = document_list;
        this._hint = hint;
        this._custom_copy_data = custom_copy_data;
    }

    get title():string {
        return this._title;
    }

    set title(value:string) {
        this._title = value;
    }

    get max_score():number {
        return this._max_score;
    }

    set max_score(value:number) {
        this._max_score = value;
    }

    get statement():string {
        return this._statement;
    }

    set statement(value:string) {
        this._statement = value;
    }

    get document_list():IGrainDocument[] {
        return this._document_list;
    }

    set document_list(value:IGrainDocument[]) {
        this._document_list = value;
    }

    get hint():string {
        return this._hint;
    }

    set hint(value:string) {
        this._hint = value;
    }

    get custom_copy_data():any {
        return this._custom_copy_data;
    }

    set custom_copy_data(value:any) {
        this._custom_copy_data = value;
    }
}
