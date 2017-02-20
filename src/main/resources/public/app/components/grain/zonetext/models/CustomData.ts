declare var _: any;

module zonetext {
    export interface TextZone extends zonegrain.Zone {
        position: {
            x: number,
            y: number,
            z: number
        };
        options: string[];
    }

    export class CustomData implements zonegrain.CustomData {
        zones: TextZone[];
        _guideImage: string;
        answersType: string;
        options: string[];

        constructor(copyFrom?: CustomData) {
            if (!copyFrom){
                this.zones = [];
                this.options = [];
                this.answersType = 'text';
            }
            else{
                if (copyFrom.zones) {
                    this.zones = JSON.parse(JSON.stringify(copyFrom.zones));
                }
                if (copyFrom.options) {
                    this.options = JSON.parse(JSON.stringify(copyFrom.options));
                }
                this._guideImage = copyFrom._guideImage;
                this.answersType = copyFrom.answersType;
            }
        }

        addZone(zone: zonetext.TextZone){
            if(!zone.position){
                zone.position = {
                    x: this.zones.length * 15,
                    y: this.zones.length * 15,
                    z: this.zones.length
                };
            }
            
            this.zones.push(zone);
        }

        removeZone(zone: zonetext.TextZone) {
            let i = this.zones.indexOf(zone);
            this.zones.splice(i, 1);
        }

        set guideImageFile(file: { _id: string }){
            this._guideImage = '/workspace/document/' + file._id;
        }

        get guideImage(): string {
            return this._guideImage || (window as any).skin.basePath + 'img/illustrations/image-default.svg';
        }

        set guideImage(value: string) {
            this._guideImage = value;
        }
    }
}