interface IGrainType {
    id:number;
    name:string;
    public_name:string;
    illustration:string;
}

class GrainType implements IGrainType {

   private _id:number;
   private _name:string;
   private _public_name:string;
   private _illustration:string;
    
    constructor
    (
        id?:number, 
        name?:string, 
        public_name?:string, 
        illustration?:string)
    {
        this._id = id;
        this._name = name;
        this._public_name = public_name;
        this._illustration = illustration;
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
}