interface IGrainDocument {
    id:number;
    owner:string;
    ownerName:string;
    created:string;
    title:string;
    name:string;
    path:string;
}

class GrainDocument implements IGrainDocument {

    id:number;
    owner:string;
    ownerName:string;
    created:string;
    title:string;
    name:string;
    path:string;

    constructor
    (
        id?:number,
        owner?:string,
        ownerName?:string,
        created?:string,
        title?:string,
        name?:string,
        path?:string
    )
    {
        this.id = id;
        this.owner = owner;
        this.ownerName = ownerName;
        this.created = created;
        this.title = title;
        this.name = name;
        this.path = path;
    }
}