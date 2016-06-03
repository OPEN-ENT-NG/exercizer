class StudentDashboardController {

    /**
     * INJECT
     */
    private _$location;
    private _$scope;
    private _subjectCopyService;

    static $inject = [
        '$location',
        '$scope',
        'SubjectCopyService'
    ];

    constructor($location, $scope, SubjectCopyService) {
        var self = this;
        this._$location = $location;
        this._$scope = $scope;
        this._subjectCopyService = SubjectCopyService;
        //this._subjectCopyService.loadSubjectCopyList();
    }


}
