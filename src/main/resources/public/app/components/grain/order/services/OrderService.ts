class OrderService implements IAutomaticCorrection {

    constructor() {}

    public automaticCorrection(grainCopy:IGrainCopy, grainScheduled:IGrainScheduled):IGrainCopy {

        // TODO

        //grainCopy.calculated_score = isCorrect ? grainScheduled.grain_data.max_score : 0;

        return grainCopy;
    }
}