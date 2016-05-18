interface IPreviewSubjectService {
    initPreviewSubject();
    initAutoCorrection();
    displayPreviewSubjectPerform : boolean
    displayPreviewCopyCorrect:boolean
    subjectCopy :ISubjectCopy;
    subjectScheduled : ISubjectScheduled
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

    /**
     * VARIABLES
     */
    private _displayPreviewSubjectPerform : boolean;
    private _displayPreviewCopyCorrect : boolean;

    private _subjectCopy : ISubjectCopy;
    private _subjectScheduled : ISubjectScheduled;

    /**
     * SERVICES
     */
    private subjectService;
    private subjectScheduledService;
    private copyService;
    private grainService;
    private grainCopyService;
    private grainScheduledService;

    constructor(subjectService,
                SubjectScheduledService,
                CopyService,
                GrainService,
                GrainCopyService,
                GrainScheduledService) {
        // set display light box to false
        this._displayPreviewSubjectPerform = false;
        this._displayPreviewCopyCorrect = false;
        this.subjectService = subjectService;
        this.subjectScheduledService = SubjectScheduledService;
        this.copyService = CopyService;
        this.grainService = GrainService;
        this.grainCopyService = GrainCopyService;
        this.grainScheduledService = GrainScheduledService;

    }

    /**
     * GETTER displayPreviewSubjectPerform
     * @returns {boolean}
     */
    public get displayPreviewSubjectPerform():boolean {
        return this._displayPreviewSubjectPerform;
    }

    /**
     * SETTER displayPreviewSubjectPerform
     * @param value
     */
    public set displayPreviewSubjectPerform(value:boolean) {
        this._displayPreviewSubjectPerform = value;
    }

    /**
     * GETTER displayPreviewCopyCorrect
     * @returns {boolean}
     */
    public get displayPreviewCopyCorrect():boolean {
        return this._displayPreviewCopyCorrect;
    }

    /**
     * SETTER displayPreviewCopyCorrect
     * @param value
     */
    public set displayPreviewCopyCorrect(value:boolean) {
        this._displayPreviewCopyCorrect = value;
    }

    /**
     * GETTER subjectCopy
     * @returns {ISubjectCopy}
     */
    public get subjectCopy():ISubjectCopy {
        return this._subjectCopy;
    }

    /**
     * GETTER subjectScheduled
     * @returns {ISubjectScheduled}
     */
    public get subjectScheduled():ISubjectScheduled {
        return this._subjectScheduled;
    }

    /**
     * Init The preview of the subject
     */
    public initPreviewSubject(){
        var self = this;
        // display lightbox preview perform
        this._displayPreviewSubjectPerform = true;
        // Get subject
        var subject = this.subjectService.getCurrentSubject();
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

    /**
     * Init the preview of the auto correction
     */
    public initAutoCorrection(){
        this._displayPreviewSubjectPerform = false;
        this._displayPreviewCopyCorrect = true;
    }
}


