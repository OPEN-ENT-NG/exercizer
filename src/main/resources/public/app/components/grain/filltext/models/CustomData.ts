declare var _: any;

module filltext {
    export interface TextZone extends zonegrain.Zone {
        options: string[];
        id: number;
    }

    export class CustomData implements zonegrain.CustomData {
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

        addZone(zone: filltext.TextZone) {
            zone.id = 0;
            if (this.zones.length > 0) {
                zone.id = this.zones[this.zones.length - 1].id + 1;
            }

            this.zones.push(zone);
        }

        removeZone(zone: filltext.TextZone) {
            let i = this.zones.indexOf(zone);
            this.zones.splice(i, 1);
        }
    }
}