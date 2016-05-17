/**
 * Created by Erwan_LP on 29/04/2016.
 */
class TeacherCreateSubjectCtrl {

    private $location;

    static $inject = [
        '$location',
        'SubjectService',
    ];
    public subject : ISubject;
    private subjectService;

    constructor(
        $location,
        SubjectService
    ) {
        this.$location = $location;
        this.subjectService = SubjectService;

    }

    public clickSaveSubject(){
        var self = this;
        this.subjectService.createSubject(
            this.subject,
            function(data){
                console.info(data);
                self.$location.path('/teacher/subject/edit')
            },
            function(err){
                console.error(err);
            }
        );
    }

    public clickCancel(){

    }
}