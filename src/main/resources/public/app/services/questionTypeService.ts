/**
 * Created by Erwan_LP on 03/05/2016.
 */

interface IQuestionType {
    name : string;
    publicName : string;
    directiveName : string;
    picture : string;

}

interface IQuestionTypeService {
    questionTypeList : IQuestionType[]

}

class QuestionTypeService implements IQuestionTypeService {

    static $inject = [
    ];

    private _questionTypeList :IQuestionType[];


    constructor(
    ) {
        console.log('QuestionTypeService');
        this._questionTypeList = this.feedQuestionTypeList();
    }

    public get questionTypeList():IQuestionType[] {
        return this._questionTypeList;
    }

    private feedQuestionTypeList()  :IQuestionType[]{
        return [
            {
                name : "openQuestion",
                publicName : "Question Libre",
                directiveName : "edit-open-question",
                picture : "http://www.barmitzvah-online.com/wp-content/uploads/2013/12/question-300x300.jpg"
            },
            {
                name : "simpleAnswer",
                publicName : "Réponse Simple",
                directiveName : "edit-simple-answer",
                picture : "http://www.barmitzvah-online.com/wp-content/uploads/2013/12/question-300x300.jpg"
            }
        ];
    }

}