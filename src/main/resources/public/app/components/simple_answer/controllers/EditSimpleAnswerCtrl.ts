/**
 * Created by Erwan_LP on 29/04/2016.
 */

class EditSimpleAnswerCtrl {

    private $location;

    static $inject = [
        'SubjectService',
    ];

    public subject : ISubject;
    private subjectService;

    private grain : IGrain;

    constructor(
        SubjectService
    ){
        this.subjectService = SubjectService;
    }
}