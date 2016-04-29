/**
 * Created by Erwan_LP on 29/04/2016.
 */

class TeacherCreateSubjectCtrl {

    private $state:ng.ui.IStateService;

    static $inject = [
        '$location',
    ];

    public subject : any;

    constructor(
        $location

    ) {
        this.$location = $location;
        console.log('TeacherCreateSubjectCtrl');
        this.subject = {};
    }


    public clickSaveSubject(){
        console.log(this.subject);
        this.$location.path('/teacher/subject/edit')

    }

}