interface IGrainType {
    id:number;
    name:string;
    public_name:string;
    illustration:string;
    is_in_list:boolean;
}

class GrainType implements IGrainType {

    private _id:number;
    private _name:string;
    private _public_name:string;
    private _illustration:string;
    private _is_in_list:boolean;

    constructor
    (
        id?:number,
        name?:string,
        public_name?:string,
        illustration?:string,
        is_in_list?:boolean
    )
    {
        this._id = id;
        this._name = name;
        this._public_name = public_name;
        this._illustration = illustration;
        this._is_in_list = is_in_list;
    }

    get id():number {
        return this._id;
    }

    set id(value:number) {
        this._id = value;
    }

    get name():string {
        return this._name;
    }

    set name(value:string) {
        this._name = value;
    }

    get public_name():string {
        return this._public_name;
    }

    set public_name(value:string) {
        this._public_name = value;
    }

    get illustration():string {
        return this._illustration;
    }

    set illustration(value:string) {
        this._illustration = value;
    }

    get is_in_list():boolean {
        return this._is_in_list;
    }

    set is_in_list(value:boolean) {
        this._is_in_list = value;
    }
}