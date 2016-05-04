/**
 * Created by Erwan_LP on 03/05/2016.
 */

class TeacherEditSubjectCtrl {

    private $location;

    static $inject = [
        'GrainCreationService'
    ];

    private grainCreationService;

    constructor(
        GrainCreationService

    ) {
        console.log('TeacherEditSubjectCtrl');
        this.grainCreationService = GrainCreationService;

    }

    public get itemGrainCreationList():IGrainCreation[] {
        return this.grainCreationService.grainCreationList;
    }
}

