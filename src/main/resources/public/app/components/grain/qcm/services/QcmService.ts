class QcmService implements IAutomaticCorrection {

    constructor() {}

    public automaticCorrection(grainScheduled:IGrainScheduled, grainCopy:IGrainCopy):{calculated_score:number, answers_result:{}} {
        var numberGoodAnswer : number = 0,
            numberRecognizedAnswer : number = 0,
            atLeastOneError =  false,
            isCorrectReturnArray = {};
        angular.forEach(grainCopy.grain_copy_data.custom_copy_data.filled_answer_list, function(filled_answer, key){
            if(angular.isUndefined(filled_answer.isChecked)){
                filled_answer.isChecked = false;
            }
            if(angular.isUndefined(grainScheduled.grain_data.custom_data.correct_answer_list[key].isChecked)){
                grainScheduled.grain_data.custom_data.correct_answer_list[key].isChecked = false;
            }
            if(filled_answer.isChecked === grainScheduled.grain_data.custom_data.correct_answer_list[key].isChecked){
                if(grainScheduled.grain_data.custom_data.correct_answer_list[key].isChecked){
                    // response is check and good
                    // in this case numberGoodAnswer++
                    numberRecognizedAnswer++;
                    isCorrectReturnArray[key] = true;
                    if(grainScheduled.grain_data.custom_data.no_error_allowed && atLeastOneError){
                        // do not incremented
                    } else{
                        numberGoodAnswer++
                    }

                } else {
                    // response is not check and good
                    // in this case the answer is not good
                    isCorrectReturnArray[key] = undefined;

                }

            } else {

                isCorrectReturnArray[key] = false;
                atLeastOneError = true;
                numberRecognizedAnswer++;
                if(grainScheduled.grain_data.custom_data.no_error_allowed){
                    numberGoodAnswer = 0;
                }

                if(grainScheduled.grain_data.custom_data.correct_answer_list[key].isChecked){
                    // response is check and not good
                    isCorrectReturnArray[key] = true;
                } else {
                    // response is not check and not good
                    isCorrectReturnArray[key] = false;

                }
            }
        });

        var calculated_score;
        if(numberRecognizedAnswer == 0){
            if(atLeastOneError){
                calculated_score = 0
            } else{
                calculated_score = grainScheduled.grain_data.max_score;
            }

        } else {
            // computation score
            calculated_score = (numberGoodAnswer / numberRecognizedAnswer) * grainScheduled.grain_data.max_score;
        }



        if(isNaN(calculated_score)){
            throw "calculated score is not a number"
        }
        return {
            calculated_score: calculated_score,
            answers_result: isCorrectReturnArray

        };
    }
}