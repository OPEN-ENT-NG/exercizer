class TeacherDashboardController {
    
    private _currentTab;
    private _$location: ng.ILocationService;
    private _$window;

    static $inject = [
        '$location',
        '$window'
    ];

    constructor($location, $window) {
        this._$location = $location;
        this._$window = $window;
    }

    get currentTab() {
        return this._currentTab;
    }
    
    set currentTab(value:number) {
        this._currentTab = value;
    }

    public switchToStudentView(){
        this._$location.path('/dashboard/student');
        this._$window.location.reload();
    }
}
