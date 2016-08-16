module zonetext {
    export function automaticCorrection(grainScheduled: IGrainScheduled, grainCopy: IGrainCopy): {
            calculated_score: number, answers_result: { correction: boolean[] }
        } {
        var customCopyData = grainCopy.grain_copy_data.custom_copy_data as CustomData;
        var customData = grainScheduled.grain_data.custom_data as CustomData;

        var textZonesCorrection = [];
        customData.textZones.forEach((textZone, i) => {
            textZonesCorrection.push(
                textZone.answer.toLowerCase() === customCopyData.textZones[i].answer.toLowerCase()
            );
        });

        return {
            calculated_score: textZonesCorrection.indexOf(false) === -1 ? grainScheduled.grain_data.max_score : 0,
            answers_result: {
                correction: textZonesCorrection
            }
        };
    }
}