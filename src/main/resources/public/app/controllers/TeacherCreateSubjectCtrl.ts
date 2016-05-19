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

    public clickSaveSubject() {
        
        if (!this.subject || !this.subject.title || this.subject.title.length === 0) {
            notify.info('Veuillez renseigner un titre.');
        } else {
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
    }

    public clickCancel() {
        this.subject = this.subjectService.createObjectSubject();
    }
}