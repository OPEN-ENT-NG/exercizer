class OpenAnswerService implements IAutomaticCorrection {

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