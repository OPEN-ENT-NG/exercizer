/**
 * Created by Erwan_LP on 29/04/2016.
 */

class TeacherHomeCtrl {

    private $state:ng.ui.IStateService;


    static $inject = [
        '$location',
    ];

    constructor(
        $location

    ) {
        this.$location = $location;
        console.log('TeacherHomeCtrl');
    }

    public clickCreateNewSubject() {
        console.log('clickCreateNewSubject');
        this.$location.path('/teacher/subject/create')
    };


}
