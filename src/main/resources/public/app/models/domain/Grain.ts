interface IGrain {
    id: number;
    subject_id: number;
    grain_type_id: number;
    created: string;
    modified: string;
    order_by: number;
    grain_data: IGrainData;
}

class Grain implements IGrain {

    constructor
        (
        id?: number,
        subject_id?: number,
        grain_type_id?: number,
        created?: string,
        modified?: string,
        order_by?: number,
        grain_data?: IGrainData
        ) {
        this.id = id;
        this.subject_id = subject_id;
        this.grain_type_id = grain_type_id;
        this.created = created;
        this.modified = modified;
        this.order_by = order_by;
        this.grain_data = grain_data;
    }
}
