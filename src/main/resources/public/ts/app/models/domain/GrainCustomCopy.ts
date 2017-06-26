import { IGrainCopyData } from './GrainCopyData';

export interface IGrainCustomCopy {
    grain_id:number;
    grain_copy_data:IGrainCopyData;
}

export class GrainCustomCopy implements IGrainCustomCopy {

    grain_id:number;
    grain_copy_data:IGrainCopyData;


    constructor
    (
        grain_id?:number, 
        grain_copy_data?:IGrainCopyData
    ) 
    {
        this.grain_id = grain_id;
        this.grain_copy_data = grain_copy_data;
    }
}