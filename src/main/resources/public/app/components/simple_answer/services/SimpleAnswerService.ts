/**
 * Created by Erwan_LP on 06/05/2016.
 */
/**
 * Created by jun on 22/04/2016.
 */
interface ISimpleAnswerService {
    createObjectCustomData() : ISimpleAnswerCustomData;
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

}