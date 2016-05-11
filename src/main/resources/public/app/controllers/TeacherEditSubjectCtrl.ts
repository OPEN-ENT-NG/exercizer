/**
 * Created by Erwan_LP on 03/05/2016.
 */

class TeacherEditSubjectCtrl {

    static $inject = [
        'GrainService',
        'SubjectService',
        'GrainTypeService',
        'SelectedGrainService'

    ];

    private grainService;
    private subjectService;
    private grainTypeService;
    private selectedGrainService;
    public displayLightBoxDeleteGrain;

    constructor(
        GrainService,
        SubjectService,
        GrainTypeService,
        SelectedGrainService

    ) {
        this.grainService = GrainService;
        this.subjectService = SubjectService;
        this.grainTypeService = GrainTypeService;
        this.selectedGrainService = SelectedGrainService;
    }

    public getCurrentSubject(){
        return this.subjectService.subjectById(this.subjectService.currentSubjectId);
    }

}

