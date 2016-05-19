class TeacherHomeCtrl {

    private $location;

    static $inject = [
        '$location',
        'SubjectService',
    ];
    
    private _subjectService: ISubjectService;
    private _openLightboxSubjectProperties: boolean;

    constructor(
        $location,
        SubjectService: ISubjectService
    ) {
        this.$location = $location;
        this._subjectService = SubjectService;
        this._openLightboxSubjectProperties = false;
    };

    get openLightboxSubjectProperties(): boolean {
        return this._openLightboxSubjectProperties;
    };

    set openLightboxSubjectProperties(value: boolean) {
        this._openLightboxSubjectProperties = value;
    };

    public displaySubjectProperties() {
        this._openLightboxSubjectProperties = true;
    };


}
