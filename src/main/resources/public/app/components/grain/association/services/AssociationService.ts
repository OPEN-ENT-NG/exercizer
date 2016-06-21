class AssociationService implements IAutomaticCorrection {

    constructor() {}

    public automaticCorrection(grainScheduled:IGrainScheduled, grainCopy:IGrainCopy):{calculated_score:number, answers_result:{}} {
        var numberGoodAnswer : number = 0,
            atLeastOneError =  false,
            isCorrectReturnArray = {},
            correct_answer;
        angular.forEach(grainCopy.grain_copy_data.custom_copy_data.filled_answer_list, function(filled_answer, key){
            correct_answer = grainScheduled.grain_data.custom_data.correct_answer_list[key];
            if(
                CompareStringHelper.compare(filled_answer.text_left,correct_answer.text_left)
            &&
                CompareStringHelper.compare(filled_answer.text_right,correct_answer.text_right)
            ){
                isCorrectReturnArray[key] = true;
                if(grainScheduled.grain_data.custom_data.no_error_allowed && atLeastOneError){
                    // do not incremented
                } else{
                    numberGoodAnswer++
                }

            } else {
                isCorrectReturnArray[key] = false;
                atLeastOneError = true;
                if(grainScheduled.grain_data.custom_data.no_error_allowed){
                    numberGoodAnswer = 0;
                }
            }

        });
        // computation score
        var numberPossibleAnswer : number = grainScheduled.grain_data.custom_data.correct_answer_list.length;
        var calculated_score = (numberGoodAnswer / numberPossibleAnswer) * grainScheduled.grain_data.max_score;
        if(isNaN(calculated_score)){
            throw "calculated score is not a number"
        }
        return {
            calculated_score: calculated_score,
            answers_result: isCorrectReturnArray

        };
    }
}