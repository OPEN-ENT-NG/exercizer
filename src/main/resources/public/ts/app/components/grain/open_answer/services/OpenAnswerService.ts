import { IAutomaticCorrection } from '../../../../models/interfaces/IAutomaticCorrection';
import { IGrainCopy, IGrainScheduled } from '../../../../models/domain';
import { ng } from 'entcore';

export class OpenAnswerService implements IAutomaticCorrection {

    constructor() {}

    public automaticCorrection(grainScheduled:IGrainScheduled, grainCopy:IGrainCopy):{calculated_score:number, answers_result:{}} {
        return {
            calculated_score: 0,
            answers_result: {
                filled_answer: null
            }
        };
    }
}

export const openAnswerService = ng.service('OpenAnswerService', OpenAnswerService);