interface IFolder {
    id:number;
    parent_folder_id:number;
    owner:string;
    created:string;
    modified:string;
    label:string;
}

class Folder implements IFolder {

    id:number;
    parent_folder_id:number;
    owner:string;
    created:string;
    modified:string;
    label:string;
    
    constructor
    (
        id?:number,
        parent_folder_id?:number,
        owner?:string,
        created?:string,
        modified?:string,
        label?:string
    )
    {
        this.id = id;
        this.parent_folder_id = parent_folder_id;
        this.owner = owner;
        this.created = created;
        this.modified = modified;
        this.label = label;
    }
}
