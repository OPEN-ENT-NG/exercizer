/**
 * Created by Erwan_LP on 06/05/2016.
 */
/**
 * Created by jun on 22/04/2016.
 */
interface ISimpleAnswerService {
    createObjectCustomData() : ISimpleAnswerCustomData;
    createObjectCustomCopyData() : ISimpleAnswerCustomCopyData;
}

class SimpleAnswerService implements ISimpleAnswerService {

    static $inject = [

    ];

    constructor(
    ) {

    }

    public createObjectCustomData() : ISimpleAnswerCustomData{
        var custom_data : ISimpleAnswerCustomData = {
            correct_answer : null
        };
        return custom_data;
    }
    public createObjectCustomCopyData() : ISimpleAnswerCustomCopyData{
        var custom_copy_data : ISimpleAnswerCustomCopyData = {
            student_answer : null
        };
        return custom_copy_data;
    }

    public automaticCorrection(grain_copy : IGrainCopy, grain_scheduled : IGrainScheduled){
        var student_answer = grain_copy.grain_copy_data.custom_copy_data.student_answer;
        var correct_answer = grain_scheduled.grain_data.custom_data.correct_answer;
        if(student_answer == correct_answer){
            grain_copy.calculated_score = grain_scheduled.grain_data.max_score
        } else{
            grain_copy.calculated_score = 0;
        }

    }

}