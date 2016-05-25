interface IGrainData {
    title:string;
    max_score:number;
    statement:string;
    document_list:IGrainDocument[];
    hint:string;
    correction :string;
    custom_data:any;
}

class GrainData implements IGrainData {

    private _title:string;
    private _max_score:number;
    private _statement:string;
    private _document_list:IGrainDocument[];
    private _hint:string;
    private _correction :string;
    private _custom_data:any;


    constructor
    (
        title?:string, 
        max_score?:number, 
        statement?:string, 
        document_list?:IGrainDocument[], 
        hint?:string, 
        correction?:string, 
        custom_data?:any
    ) 
    {
        this._title = title;
        this._max_score = max_score;
        this._statement = statement;
        this._document_list = document_list;
        this._hint = hint;
        this._correction = correction;
        this._custom_data = custom_data;
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

    get correction():string {
        return this._correction;
    }

    set correction(value:string) {
        this._correction = value;
    }

    get custom_data():any {
        return this._custom_data;
    }

    set custom_data(value:any) {
        this._custom_data = value;
    }
}