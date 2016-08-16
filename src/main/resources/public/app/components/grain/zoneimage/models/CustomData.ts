declare var _: any;

module zoneimage {
    export interface IconZone {
        position?: {
            x: number,
            y: number,
            z: number
        };
        answer: string;
    }

    export class CustomData {
        iconZones: IconZone[];
        _guideImage: string;
        options: string[];

        constructor(copyFrom?: CustomData) {
            if(!copyFrom){
                this.iconZones = [];
                this.options = [];
            }
            else{
                this.iconZones = JSON.parse(JSON.stringify(copyFrom.iconZones));
                this.options = JSON.parse(JSON.stringify(copyFrom.options));
                this._guideImage = copyFrom._guideImage;
            }
        }

        addZone(zone: IconZone){
            if(!zone.position){
                zone.position = {
                    x: 0,
                    y: 0,
                    z: this.iconZones.length
                };
            }
            
            this.iconZones.push(zone);
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

    export function makeCopy(customData: CustomData) {
        var copy = new CustomData(customData);
        copy.iconZones.forEach((iconZone) => {
            iconZone.answer = '';
        });
        return copy;
    }
}