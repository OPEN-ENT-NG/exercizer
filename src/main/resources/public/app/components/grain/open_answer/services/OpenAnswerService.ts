class OpenAnswerService implements IAutomaticCorrection {

    constructor() {}

    public automaticCorrection(grainScheduled:IGrainScheduled, grainCopy:IGrainCopy):{calculated_score:number, answers_result:{}} {

        // NO AUTOCORRECTION

        return;
    }
}