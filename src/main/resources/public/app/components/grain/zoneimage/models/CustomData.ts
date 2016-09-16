declare var _: any;

module zoneimage {
    export interface IconZone extends zonegrain.Zone {
        position?: {
            x: number,
            y: number,
            z: number
        };
    }

    export class CustomData implements zonegrain.CustomData {
        zones: IconZone[];
        _guideImage: string;
        options: string[];

        constructor(copyFrom?: CustomData) {
            if (!copyFrom){
                this.zones = [];
                this.options = [];
            }
            else {
                if (copyFrom.zones) {
                    this.zones = JSON.parse(JSON.stringify(copyFrom.zones));
                }
                if (copyFrom.options) {
                    this.options = JSON.parse(JSON.stringify(copyFrom.options));
                }
                
                this._guideImage = copyFrom._guideImage;
            }
        }

        addZone(zone: IconZone){
            if(!zone.position){
                zone.position = {
                    x: this.zones.length * 15,
                    y: this.zones.length * 15,
                    z: this.zones.length
                };
            }
            
            this.zones.push(zone);
        }

        set guideImageFile(file: { _id: string }){
            this._guideImage = '/workspace/document/' + file._id;
        }

        get guideImage(): string {
            return this._guideImage || (window as any).skin.theme + '../img/illustrations/image-default.svg';
        }

        set guideImage(value: string) {
            this._guideImage = value;
        }
    }
}