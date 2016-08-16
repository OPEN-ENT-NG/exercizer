declare var _: any;

module zonetext {
    export interface TextZone {
        position: {
            x: number,
            y: number,
            z: number
        };
        answer: string;
        options: string[];
    }

    export class CustomData {
        textZones: TextZone[];
        _guideImage: string;
        answersType: string;
        options: string[];

        constructor(copyFrom?: CustomData) {
            if(!copyFrom){
                this.textZones = [];
                this.options = [];
            }
            else{
                this.textZones = JSON.parse(JSON.stringify(copyFrom.textZones));
                this.options = JSON.parse(JSON.stringify(copyFrom.options));
                this._guideImage = copyFrom._guideImage;
                this.answersType = copyFrom.answersType;
            }
        }

        addZone(zone: zonetext.TextZone){
            if(!zone.position){
                zone.position = {
                    x: 0,
                    y: 0,
                    z: this.textZones.length
                };
            }
            
            this.textZones.push(zone);
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
        copy.textZones.forEach((textZone) => {
            textZone.answer = '';
        });
        return copy;
    }
}