import { EditTrackingEvent, trackingService } from 'entcore';
import { IGrainData } from './GrainData';

export interface IGrain {
    id: number;
    subject_id: number;
    grain_type_id: number;
    created: string;
    modified: string;
    order_by: number;
    grain_data: IGrainData;
    selected: boolean;
    getTracker(): EditTrackingEvent;
    cleanBeforeUpdate():IGrainData
    clone(): IGrain;
}

export class Grain implements IGrain {

    id: number;
    subject_id: number;
    grain_type_id: number;
    created: string;
    modified: string;
    order_by: number;
    grain_data: IGrainData;
    selected: boolean;
    tracker?: EditTrackingEvent;

    constructor
    (
        id?: number,
        subject_id?: number,
        grain_type_id?: number,
        created?: string,
        modified?: string,
        order_by?: number,
        grain_data?: IGrainData,
        grain_custom_data?: any,
        selected?: boolean
    ) {
        this.id = id;
        this.subject_id = subject_id;
        this.grain_type_id = grain_type_id;
        this.created = created;
        this.modified = modified;
        this.order_by = order_by;
        this.grain_data = grain_data;
        this.selected = selected;
    }

    getTracker():EditTrackingEvent{
        if(!this.tracker){
            const id = this.id? this.id+'':null;
            this.tracker = trackingService.trackEdition({resourceId:id, resourceUri:`/exercizer/${this.subject_id}/grain/${this.id}`})
        }
        return this.tracker;
    }

    clone(): IGrain {
        const copy = new Grain();
        for (const attr in this) {
            if (this.hasOwnProperty(attr)){
                (copy as any)[attr] = this[attr];
            }
        }
        return copy;
    }

    cloneData(): IGrainData {
        return deepCopy(this.grain_data);
    }

    cleanBeforeUpdate():IGrainData{
        if(this.grain_type_id == 8){
            //association
            const clone = this.cloneData();
            const answers = clone.custom_data.correct_answer_list || [];
            clone.custom_data.correct_answer_list = answers.filter(answer=>{
                return answer.text_right || answer.text_left;
            })
            return clone;
        }
        return this.grain_data;
    }
}

function deepCopy<T>(obj: T) {
    if(typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if(obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if(obj instanceof Array) {
        return obj.reduce((arr, item, i) => {
            arr[i] = deepCopy(item);
            return arr;
        }, []);
    }
    if(obj instanceof Object) {
        return Object.keys(obj).reduce((newObj, key) => {
            newObj[key] = deepCopy(obj[key]);
            return newObj;
        }, {})
    }
}