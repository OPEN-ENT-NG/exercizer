export interface IGrainType {
    id:number;
    name:string;
    public_name:string;
    illustration:string;
    is_in_list:boolean;
}

export class GrainType implements IGrainType {

    id:number;
    name:string;
    public_name:string;
    illustration:string;
    is_in_list:boolean;

    constructor
    (
        id?:number,
        name?:string,
        public_name?:string,
        illustration?:string,
        is_in_list?:boolean
    )
    {
        this.id = id;
        this.name = name;
        this.public_name = public_name;
        this.illustration = illustration;
        this.is_in_list = is_in_list;
    }
}