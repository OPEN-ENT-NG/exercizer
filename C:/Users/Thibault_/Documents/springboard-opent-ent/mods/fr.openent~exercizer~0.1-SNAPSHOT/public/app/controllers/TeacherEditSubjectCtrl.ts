/**
 * Created by Erwan_LP on 03/05/2016.
 */

class TeacherEditSubjectCtrl {

    static $inject = [
        'GrainService',
        'SubjectService',
        'GrainTypeService'

    ];

    private grainService;
    private subjectService;
    private grainTypeService;

    constructor(
        GrainService,
        SubjectService,
        GrainTypeService

    ) {
        this.grainService = GrainService;
        this.subjectService = SubjectService;
        this.grainTypeService = GrainTypeService;
    }

    public get grainListByCurrentSubject() {
        var subject_id = this.subjectService.currentSubjectId;
        return this.grainService.grainListBySubjectId(subject_id);
    }

    public isNewGrain(grain : IGrain){
        if(grain){
            if(grain.grain_type_id){
                return "grain";
            } else{
                return "new";
            }
        }
    }

    public getTypeNameByTypeId(id : number){
        return this.grainTypeService.getTypeNameByTypeId(id);
    }
}

