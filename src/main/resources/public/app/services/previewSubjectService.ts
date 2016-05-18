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

        // Get subject
        var subject = this.subjectService.subjectById(this.subjectService.currentSubjectId);
        //compute max score
        this.subjectService.computeMaxScoreForCurrentSubject();
        // Create subject scheduled
        this._subjectScheduled = this.subjectScheduledService.createObjectSubjectScheduledFromSubject(subject);
        // Create subject copy
        this._subjectCopy = this.copyService.createObjectSubjectCopyFromSubjectScheduled(this._subjectScheduled);
        // reset subject copy
        this.copyService.createObjectSubjectCopyFromSubjectScheduled(this._subjectScheduled);
        // Get grain list
        var grainList = this.grainService.grainListBySubjectId(this.subjectService.currentSubjectId);
        // create grain Scheduled list
        this.grainScheduledService.createGrainScheduledList(this._subjectScheduled.id);
        // create grain Copy List
        this.grainCopyService.createGrainCopyList(this._subjectCopy.id);
        // loop on grain List
        angular.forEach(grainList, function(grain, key) {
            //create grain scheduled from grain
            var grainScheduled = self.grainScheduledService.createObjectGrainScheduledFromGrain(grain);
            // add subject scheduled id to grain scheduled
            grainScheduled.subject_scheduled_id = self._subjectScheduled.id;
            // push grain scheduled in grain scheduled list
            self.grainScheduledService.addGrainScheduledToGrainScheduledList(grainScheduled);
            // create grain copy from grain
            var grainCopy = self.grainCopyService.createObjectGrainCopyFromGrain(grain);
            // add subject copy id to grain copy
            grainCopy.subject_copy_id = self._subjectCopy.id;
            // add grain scheduled id to grain copy
            grainCopy.grain_scheduled_id = grainScheduled.id;
            // push grain copy to grain copy list
            self.grainCopyService.addGrainCopyToGrainCopyList(grainCopy);
        });
    }

    public initAutoCorrection(){
        this._displayPreviewSubjectPerform = false;
        this._displayPreviewCopyCorrect = true;
    }
}


