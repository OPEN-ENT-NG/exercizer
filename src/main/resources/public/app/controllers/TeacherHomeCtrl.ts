class TeacherHomeCtrl {

    private $location;


    static $inject = [
        '$location',
    ];

    private _displayLightboxCreateSubject : boolean;

    constructor(
        $location

    ) {
        this.$location = $location;
        this._displayLightboxCreateSubject = false;
    }


    get displayLightboxCreateSubject():boolean {
        return this._displayLightboxCreateSubject;
    }

    set displayLightboxCreateSubject(value:boolean) {
        this._displayLightboxCreateSubject = value;
    }

    public clickCreateNewSubject() {
        this._displayLightboxCreateSubject =  true;
    };


}
