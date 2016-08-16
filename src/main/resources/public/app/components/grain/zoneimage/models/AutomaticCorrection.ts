module zoneimage {
    export function automaticCorrection(grainScheduled: IGrainScheduled, grainCopy: IGrainCopy): {
            calculated_score: number, answers_result: { correction: boolean[] }
        } {
        var customCopyData = grainCopy.grain_copy_data.custom_copy_data as CustomData;
        var customData = grainScheduled.grain_data.custom_data as CustomData;

        var iconZonesCorrection = [];
        customData.iconZones.forEach((iconZone, i) => {
            iconZonesCorrection.push(
                iconZone.answer.toLowerCase() === customCopyData.iconZones[i].answer.toLowerCase()
            );
        });

        return {
            calculated_score: iconZonesCorrection.indexOf(false) === -1 ? grainScheduled.grain_data.max_score : 0,
            answers_result: {
                correction: iconZonesCorrection
            }
        };
    }
}