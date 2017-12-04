import { _ } from 'entcore';
import { Zone, ICustomData } from '../../common/zonegrain/model';

export interface TextZone extends Zone {
    options: string[];
    id: number;
}

export class CustomData implements CustomData {
    zones: TextZone[];
    answersType: string;
    options: string[];
    htmlContent: string;

    constructor(copyFrom?: CustomData) {
        if (!copyFrom || !copyFrom.htmlContent) {
            this.zones = [];
            this.options = [];
            this.answersType = 'text';
        }
        else{
            this.zones = JSON.parse(JSON.stringify(copyFrom.zones));
            this.options = JSON.parse(JSON.stringify(copyFrom.options));
            this.htmlContent = copyFrom.htmlContent;
            this.answersType = copyFrom.answersType;
        }
    }

    addZone(zone: TextZone) {
        zone.id = 0;
        if (this.zones.length > 0) {
            zone.id = this.zones[this.zones.length - 1].id + 1;
        }

        this.zones.push(zone);
    }

    removeZone(zone: TextZone) {
        let i = this.zones.indexOf(zone);
        this.zones.splice(i, 1);
    }
}