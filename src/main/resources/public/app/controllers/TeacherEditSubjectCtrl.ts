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


    /**
     * SELECTED GRAIN PART
     */

    public selectedGrainIdList(){
        var res = this.selectedGrainService.selectedGrainIdList.length;
        return res;
    };

    public duplicateSelectedGrainList(){
        var self = this;
        angular.forEach(this.selectedGrainService.selectedGrainIdList, function(grain_id, key) {
            var subject_id = self.subjectService.currentSubjectId;
            var grain = self.grainService.grainByIdAndSubjectId(grain_id, subject_id);
            var newGrain =  angular.copy(grain);
            newGrain.order = null;
            newGrain.grain_data.title += " (copie)";
            self.grainService.createGrain(
                newGrain,
                function(data){
                    //success
                },
                function(err){
                    console.error(err);
                }
            )
        });
    };

    public deleteSelectedGrainList(){
        var self = this;
        angular.forEach(this.selectedGrainService.selectedGrainIdList, function(grain_id, key) {
            var subject_id = self.subjectService.currentSubjectId;
            var grain = self.grainService.grainByIdAndSubjectId(grain_id, subject_id);
            self.grainService.deleteGrain(
                grain,
                function(data){
                    //success
                },
                function(err){
                    console.error(err);
                }
            )
        });
        this.selectedGrainService.resetList();
    }

}

