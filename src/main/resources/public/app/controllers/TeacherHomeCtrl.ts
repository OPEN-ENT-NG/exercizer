class TeacherHomeCtrl {

    /**
     * INJECT
     */
    private $location;
    private folderService;
    private subjectService;
    private grainService;
    private _openLightboxSubjectProperties: boolean;



    static $inject = [
        '$location',
        'FolderService',
        'SubjectService',
        'GrainService'
    ];


    constructor(
        $location,
        FolderService,
        SubjectService: ISubjectService,
        GrainService
    ) {
        this.folderService = FolderService;
        this.subjectService = SubjectService;
        this.grainService = GrainService;
        this.$location = $location;
        this._displayLightboxCreateSubject = false;
        this.feedExercizer();
        this._openLightboxSubjectProperties = false;

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

    public subjectList(){
        return this.subjectService.subjectList;

    }

    public folderList(){
        return this.folderService.folderList;
    }

    private feedExercizer(){
        var self = this;
        // create folder
        var folder = self.folderService.createObjectFolder();
        folder.label = "A Folder";
        this.folderService.createFolder(folder,  null, null);
        var folder2 = self.folderService.createObjectFolder();
        folder2.label = "B Folder";
        this.folderService.createFolder(folder2,  null, null);
        var folder3 = self.folderService.createObjectFolder();
        folder3.label = "C Folder";
        this.folderService.createFolder(folder3,  null, null);
        var folder4 = self.folderService.createObjectFolder();
        folder4.label = "D Folder";
        this.folderService.createFolder(folder4,  null, null);

        // create subject
        var subject:ISubject = this.subjectService.createObjectSubject();
        subject.id = null;
        subject.title = "Subject Test";
        this.subjectService.createSubject(
            subject,
            function (data) {
                console.error(data);
                self.grainService.getGrainListBySubjectId(
                    data.id,
                    function () {
                        // create grain dev
                        var grainDev = self.grainService.createObjectGrain();
                        grainDev.subject_id = data.id;
                        grainDev.grain_type_id = "3";
                        grainDev.grain_data.title = "Exercise Test";
                        grainDev.grain_data.max_score = "5";
                        grainDev.grain_data.statement = "<div class=\"ng-scope\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere rhoncus dui sit amet sagittis. Vestibulum felis quam, commodo euismod egestas pellentesque, porta nec urna.&nbsp;</div>";
                        grainDev.grain_data.hint = "La réponse est 3 ";
                        grainDev.grain_data.correction = "Correction de la réponse";
                        grainDev.grain_data.custom_data = {
                            correct_answer: "3"
                        };

                        self.grainService.createGrain(
                            grainDev,
                            function () {
                                var grainDev2 = self.grainService.createObjectGrain();
                                grainDev2.subject_id = data.id;
                                grainDev2.grain_type_id = "3";
                                grainDev2.grain_data.title = "Exercise Test Numero 2";
                                grainDev2.grain_data.max_score = "5";
                                grainDev2.grain_data.statement = "<div class=\"ng-scope\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere rhoncus dui sit amet sagittis. Vestibulum felis quam, commodo euismod egestas pellentesque, porta nec urna.&nbsp;</div>";
                                grainDev2.grain_data.hint = "La réponse est 3 ";
                                grainDev2.grain_data.correction = "Correction de la réponse";
                                grainDev2.grain_data.custom_data = {
                                    correct_answer: "3"
                                };
                                self.grainService.createGrain(grainDev2, null, null);
                            },
                            null
                        );
                    },
                    null);


            },
            function (err) {

            }
        );


    }


}
