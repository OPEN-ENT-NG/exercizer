class TeacherDashboardController {
    
    private _currentTab;

    constructor() {}

    get currentTab() {
        return this._currentTab;
    }
    
    set currentTab(value:number) {
        this._currentTab = value;
    }
}
