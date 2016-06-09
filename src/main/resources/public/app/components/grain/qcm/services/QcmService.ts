class QcmService implements IAutomaticCorrection {

    constructor() {}

    public automaticCorrection(grainScheduled:IGrainScheduled, grainCopy:IGrainCopy):{calculated_score:number, answers_result:{}} {

        /*var isCorrect = CompareStringHelper.compare
        (
            grainScheduled.grain_data.custom_data.correct_answer, 
            grainCopy.grain_copy_data.custom_copy_data.filled_answer
        );

        grainCopy.calculated_score = isCorrect ? grainScheduled.grain_data.max_score : 0;*/

        // TODO

        return;
    }
}