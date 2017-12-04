import { _ } from 'entcore';
import { IGrainCopy, IGrainScheduled } from '../../../../models/domain';

export interface Zone {
    answer: string
}

export interface ICustomData {
    zones: Zone[]
}

export function automaticCorrection(grainScheduled: IGrainScheduled, grainCopy: IGrainCopy): {
    calculated_score: number, answers_result: { correction: boolean[] }
} {
    var customCopyData = grainCopy.grain_copy_data.custom_copy_data as ICustomData;
    var customData = grainScheduled.grain_data.custom_data as ICustomData;

    var textZonesCorrection = [];
    customData.zones.forEach((textZone, i) => {
        textZonesCorrection.push(
            textZone.answer && textZone.answer.toLowerCase() === customCopyData.zones[i].answer.toLowerCase()
        );
    });

    var nbPoints = (_.filter(textZonesCorrection).length / textZonesCorrection.length) * grainScheduled.grain_data.max_score;

    return {
        calculated_score: nbPoints || 0,
        answers_result: {
            correction: textZonesCorrection
        }
    };
}

export function makeZoneCustomDataCopy(customData: ICustomData, type: any) {
    var copy = new type(customData);
    copy.zones.forEach((textZone) => {
        textZone.answer = '';
    });
    return copy;
}
