import { IGrainCopy, IGrainScheduled } from '../domain';

export interface IAutomaticCorrection {
    automaticCorrection(grainScheduled:IGrainScheduled, grainCopy:IGrainCopy):{calculated_score:number, answers_result:{}};
}
