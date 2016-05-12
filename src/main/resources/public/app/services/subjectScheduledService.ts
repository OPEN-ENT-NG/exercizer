interface ISubjectScheduledService {
    createObjectSubjectScheduledFromSubject(subject:ISubject):ISubjectScheduled
}

class SubjectScheduledService implements ISubjectScheduledService {

    static $inject = [
        'SubjectService'
    ];

    private subjectService;



    constructor(SubjectService) {
        this.subjectService = SubjectService;
    }


    public createObjectGrainScheduled():ISubjectScheduled {
        return {
            id: null,
            subject_id : null,
            created : null,
            title : null,
            max_score : null,
            description : null,
            picture : null,
            begin_date :null,
            due_date : null,
            note_published_date : null,
            duration : null,
            is_over : null,
            is_one_shot_submit : null,
            has_to_randomized : null,
            is_deleted : null,
        };
    }


    public createObjectSubjectScheduledFromSubject(subject:ISubject):ISubjectScheduled {
        var subject_scheduled = this.createObjectGrainScheduled();
        subject_scheduled.id = Math.floor((Math.random() * 1000) + 1);
        subject_scheduled.title = subject.title;
        subject_scheduled.max_score = subject.max_score;
        subject_scheduled.description = subject.description;
        subject_scheduled.picture = subject.picture;
        subject_scheduled.subject_id = subject.id;
        subject_scheduled.created = new Date().toISOString();
        return subject_scheduled;
    }


    /**
     * PRIVATE HTTP
     */

    private _createObjectSubjectScheduled(subjectScheduled:ISubjectScheduled, callbackSuccess, callbackFail) {
        /**
         * TEMP
         */
        subjectScheduled.id = Math.floor((Math.random() * 1000) + 1);
        callbackSuccess(subjectScheduled);
    }

}