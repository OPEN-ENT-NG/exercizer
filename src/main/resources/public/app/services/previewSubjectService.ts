interface IPreviewSubjectService {
    displayPreviewSubject : boolean
    initPreviewSubject();
    subjectCopy :ISubjectCopy;
}

class PreviewSubjectService implements IPreviewSubjectService {

    static $inject = [
        'SubjectService',
        'SubjectScheduledService',
        'CopyService',
        'GrainService',
        'GrainCopyService'

    ];

    private _displayPreviewSubject : boolean;
    private subjectService;
    private subjectScheduledService;
    private copyService;
    private grainService;
    private grainCopyService;

    private _subjectCopy : ISubjectCopy;
    private _subjectScheduled : ISubjectScheduled;

    constructor(subjectService,
                SubjectScheduledService,
                CopyService,
                GrainService,
                GrainCopyService) {
        this._displayPreviewSubject = false;
        this.subjectService = subjectService;
        this.subjectScheduledService = SubjectScheduledService;
        this.copyService = CopyService;
        this.grainService = GrainService;
        this.grainCopyService = GrainCopyService;

    }

    public get displayPreviewSubject():boolean {
        return this._displayPreviewSubject;
    }

    public set displayPreviewSubject(value:boolean) {
        this._displayPreviewSubject = value;
    }

    get subjectCopy():ISubjectCopy {
        return this._subjectCopy;
    }


    get subjectScheduled():ISubjectScheduled {
        return this._subjectScheduled;
    }

    public initPreviewSubject(){
        var self = this;
        this._displayPreviewSubject = true;
        var subject = this.subjectService.subjectById(this.subjectService.currentSubjectId);
        console.log('subject', subject);
        var subject_scheduled = this.subjectScheduledService.createObjectSubjectScheduledFromSubject(subject);
        this._subjectScheduled = subject_scheduled;
        console.log('subject_scheduled', subject_scheduled);
        var subject_copy = this.copyService.createObjectSubjectCopyFromSubjectScheduled(subject_scheduled);
        console.log('subject_copy', subject_copy);
        this._subjectCopy = subject_copy;
        var grainList = this.grainService.grainListBySubjectId(this.subjectService.currentSubjectId);
        self.grainCopyService.createGrainCopyList(subject_copy.id);
        angular.forEach(grainList, function(grain, key) {
            var grainCopy = self.grainCopyService.createObjectGrainCopyFromGrain(grain);
            grainCopy.subject_copy_id = subject_copy.id;
            self.grainCopyService.addGrainCopyToGrainCopyList(grainCopy);
        });
        console.log('grainCopyListBySubjectCopyId', this.grainCopyService.grainCopyListBySubjectCopyId(subject_copy.id));
    }
}