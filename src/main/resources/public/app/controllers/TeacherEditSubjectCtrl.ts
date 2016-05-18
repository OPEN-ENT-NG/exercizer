class TeacherEditSubjectCtrl {

    static $inject = [
        '$routeParams',
        'GrainService',
        'SubjectService',
        'GrainTypeService',
        'SelectedGrainService'

    ];

    /**
     * Services
     */
    private grainService;
    private subjectService;
    private grainTypeService;
    private selectedGrainService;

    /**
     * Variables
     */
    private _displayLightBoxDeleteGrain;
    private _subjectId;

    constructor(
        $routeParams,
        GrainService,
        SubjectService,
        GrainTypeService,
        SelectedGrainService

    ) {
        this._subjectId = $routeParams.subjectId;
        this.grainService = GrainService;
        this.subjectService = SubjectService;
        this.grainTypeService = GrainTypeService;
        this.selectedGrainService = SelectedGrainService;
        // set the params subjectId (url) in the subjectService
        this.subjectService.currentSubjectId = this._subjectId;
    }

    /**
     * GETTER displayLightBoxDeleteGrain
     */
    get displayLightBoxDeleteGrain() {
        return this._displayLightBoxDeleteGrain;
    }

    /**
     * SETTER displayLightBoxDeleteGrain
     * @param value
     */
    set displayLightBoxDeleteGrain(value) {
        this._displayLightBoxDeleteGrain = value;
    }

    /**
     * Get current subject
     * @returns {ISubject}
     */
    public getCurrentSubject(){
        return this.subjectService.getCurrentSubject();
    }

    /**
     * Get title of the current Subject
     * @returns {string}
     */
    public getCurrentSubjectTitle(){
        var subject = this.subjectService.getCurrentSubject();
        if(subject){
            return subject.title;
        }
    }
}

