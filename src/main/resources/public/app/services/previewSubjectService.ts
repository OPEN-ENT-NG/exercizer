interface IPreviewSubjectService {
    displayPreviewSubjectPerform : boolean
    displayPreviewCopyCorrect:boolean
    initPreviewSubject();
    subjectCopy :ISubjectCopy;
    initAutoCorrection();
}

class PreviewSubjectService implements IPreviewSubjectService {

    static $inject = [
        'SubjectService',
        'SubjectScheduledService',
        'CopyService',
        'GrainService',
        'GrainCopyService',
        'GrainScheduledService'

    ];

    private _displayPreviewSubjectPerform : boolean;
    private _displayPreviewCopyCorrect : boolean;

    private subjectService;
    private subjectScheduledService;
    private copyService;
    private grainService;
    private grainCopyService;
    private grainScheduledService;

    private _subjectCopy : ISubjectCopy;
    private _subjectScheduled : ISubjectScheduled;

    constructor(subjectService,
                SubjectScheduledService,
                CopyService,
                GrainService,
                GrainCopyService,
                GrainScheduledService) {
        this._displayPreviewSubjectPerform = false;
        this._displayPreviewCopyCorrect = false;
        this.subjectService = subjectService;
        this.subjectScheduledService = SubjectScheduledService;
        this.copyService = CopyService;
        this.grainService = GrainService;
        this.grainCopyService = GrainCopyService;
        this.grainScheduledService = GrainScheduledService;

    }

    public get displayPreviewSubjectPerform():boolean {
        return this._displayPreviewSubjectPerform;
    }

    public set displayPreviewSubjectPerform(value:boolean) {
        this._displayPreviewSubjectPerform = value;
    }


    public get displayPreviewCopyCorrect():boolean {
        return this._displayPreviewCopyCorrect;
    }

    public set displayPreviewCopyCorrect(value:boolean) {
        this._displayPreviewCopyCorrect = value;
    }

    public get subjectCopy():ISubjectCopy {
        return this._subjectCopy;
    }

    public get subjectScheduled():ISubjectScheduled {
        return this._subjectScheduled;
    }

    public initPreviewSubject(){
        var self = this;
        this._displayPreviewSubjectPerform = true;
        // subject
        var subject = this.subjectService.subjectById(this.subjectService.currentSubjectId);
        // subject scheduled
        this._subjectScheduled = this.subjectScheduledService.createObjectSubjectScheduledFromSubject(subject);
        // subject copy
        this._subjectCopy = this.copyService.createObjectSubjectCopyFromSubjectScheduled(this._subjectScheduled);
        // grain list
        var grainList = this.grainService.grainListBySubjectId(this.subjectService.currentSubjectId);
        // grain copy
        this.grainCopyService.createGrainCopyList(this._subjectCopy.id);
        angular.forEach(grainList, function(grain, key) {
            var grainCopy = self.grainCopyService.createObjectGrainCopyFromGrain(grain);
            grainCopy.subject_copy_id = self._subjectCopy.id;
            self.grainCopyService.addGrainCopyToGrainCopyList(grainCopy);
        });
    }

    public initAutoCorrection(){
        var self = this;
        this._displayPreviewSubjectPerform = false;
        this._displayPreviewCopyCorrect = true;

        var grainList = this.grainService.grainListBySubjectId(this.subjectService.currentSubjectId);
        // grain scheduled
        this.grainScheduledService.createGrainScheduledList(this._subjectScheduled.id);
        angular.forEach(grainList, function(grain, key) {
            var grainScheduled = self.grainScheduledService.createObjectGrainScheduledFromGrain(grain);
            grainScheduled.subject_scheduled_id = self._subjectScheduled.id;
            self.grainScheduledService.addGrainScheduledToGrainScheduledList(grainScheduled);
        });
    }
}