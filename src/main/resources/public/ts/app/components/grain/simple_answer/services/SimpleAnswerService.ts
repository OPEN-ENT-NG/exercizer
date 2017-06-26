import { IAutomaticCorrection } from '../../../../models/interfaces/IAutomaticCorrection';
import { IGrainCopy, IGrainScheduled } from '../../../../models/domain';
import { CompareStringHelper } from '../../../../models/helpers';
import { ng } from 'entcore';

export class SimpleAnswerService implements IAutomaticCorrection {

    constructor() {}

    public automaticCorrection(grainScheduled:IGrainScheduled, grainCopy:IGrainCopy):{calculated_score:number, answers_result:{}} {

        var isCorrect = CompareStringHelper.compare
        (
            grainScheduled.grain_data.custom_data.correct_answer,
            grainCopy.grain_copy_data.custom_copy_data.filled_answer
        );

        return {
            calculated_score: isCorrect ? grainScheduled.grain_data.max_score : 0,
            answers_result: {
                filled_answer: isCorrect
            }

        };
    }
}

export const simpleAnswerService = ng.service('SimpleAnswerService', SimpleAnswerService);