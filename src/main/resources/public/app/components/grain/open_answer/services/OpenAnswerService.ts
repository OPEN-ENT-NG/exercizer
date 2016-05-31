class OpenAnswerService implements IAutomaticCorrection {

    constructor() {}

    public automaticCorrection(grainCopy:IGrainCopy, grainScheduled:IGrainScheduled):IGrainCopy {

        // NO AUTOCORRECTION

        return grainCopy;
    }
}