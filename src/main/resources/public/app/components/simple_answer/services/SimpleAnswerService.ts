interface ISimpleAnswerService {
    createObjectCustomData() : ISimpleAnswerCustomData;
    createObjectCustomCopyData() : ISimpleAnswerCustomCopyData;
    automaticCorrection(grain_copy : IGrainCopy, grain_scheduled : IGrainScheduled);
}

class SimpleAnswerService implements ISimpleAnswerService {

    static $inject = [
        'CompareStringService'

    ];

    private compareStringService;

    constructor(CompareStringService
    ) {
        this.compareStringService = CompareStringService
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
        if(this.compareStringService.compareString(student_answer,correct_answer)){
            grain_copy.calculated_score = grain_scheduled.grain_data.max_score
        } else{
            grain_copy.calculated_score = 0;
        }

    }

}