class TeacherDashboardController {

    /**
     * INJECT
     */
    private $location;
    private folderService;
    private subjectService;
    private selectionService;
    private lightboxService;
    private grainService;
    private _openLightboxSubjectProperties: boolean;



    static $inject = [
        '$location',
        'FolderService',
        'SubjectService',
        'GrainService',
        'SelectionService',
        'LightboxService'
    ];


    constructor(
        $location,
        FolderService,
        SubjectService: ISubjectService,
        GrainService,
        SelectionService,
        LightboxService
    ) {
        this.folderService = FolderService;
        this.subjectService = SubjectService;
        this.grainService = GrainService;
        this.$location = $location;
        this._openLightboxSubjectProperties = false;
        this.selectionService = SelectionService;
        this.lightboxService = LightboxService;
        this.feedExercizer();

    }

    get openLightboxSubjectProperties(): boolean {
        return this._openLightboxSubjectProperties;
    };

    set openLightboxSubjectProperties(value: boolean) {
        this._openLightboxSubjectProperties = value;
    };

    public displaySubjectProperties() {
        this._openLightboxSubjectProperties = true;
    };

    private feedExercizer(){

        var self = this;

        // create folder
        var folderA = new Folder(null, null, null, null, "A Folder");
        var folderB = new Folder(null, null, null, null, "B Folder");
        var folderC = new Folder(null, null, null, null, "C Folder");
        this.folderService.createFolder(folderA,  null, null);
        this.folderService.createFolder(folderB,  null, null);
        this.folderService.createFolder(folderC,  null, null);


        // create subject
        var subject = new Subject(null, null,null, null,null,null,null,"My Subject", "My description", null, null, null, null);

        var promise = this.subjectService.persist(subject);
        promise.then(function(subject) {
            console.log('Subject: ', subject);
        }, function(subject) {
            console.log('Failed: ', subject);
        });
    }
}
