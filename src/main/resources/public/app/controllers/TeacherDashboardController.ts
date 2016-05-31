class TeacherDashboardController {

    /**
     * INJECT
     */
    private _$location;
    private _folderService;
    private _subjectService;
    private _$scope;
    private _selectedSubjectList;
    private _selectedFolderList;

    static $inject = [
        '$location',
        '$scope',
        'FolderService',
        'SubjectService'
    ];

    constructor(
        $location,
        $scope,
        FolderService,
        SubjectService:ISubjectService
    )
    {
        var self = this;
        this._$location = $location;
        this._$scope = $scope;
        this._folderService = FolderService;
        this._subjectService = SubjectService;
        this._selectedSubjectList = [];
        this._selectedFolderList = [];
        this._eventsHandler(self);
    }

    public createSubject = function(){
        this._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT', null);
    };

    private _eventsHandler = function (self) {
        
        function _toggleItem(id, isSelected, list) {
            var index = list.indexOf(id);
            if (isSelected) {
                if (index === -1) {
                    // the item is not in the list
                    list.push(id);
                } else {
                    // the item is in the list
                    console.error('try to add an item in the list but the item is already in the list');
                }
            } else {
                if (index === -1) {
                    // the item is not in the list
                    console.error('try to remove an item from the list but item missing');
                } else{
                    // the item is not in the list
                    list.splice(index, 1);
                }
            }
        }

        self._$scope.$on('E_SELECT_FOLDER', function (event, folder) {
            _toggleItem(folder.id, folder.selected, self._selectedFolderList);
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_TOASTER',  self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on('E_SELECT_SUBJECT', function (event, subject) {
            _toggleItem(subject.id, subject.selected, self._selectedSubjectList);
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_TOASTER',  self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on('E_CREATE_FOLDER', function () {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER', null);
        });

        self._$scope.$on('E_SCHEDULE_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_SCHEDULE_SUBJECT', subject);
        });

        self._$scope.$on('E_EDIT_FOLDER', function (event, folder) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER', folder);
        });

        self._$scope.$on('E_EDIT_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT', subject);
        });

        self._$scope.$on('E_REMOVE_SELECTED_FOLDER_SUBJECT', function () {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_REMOVE_SELECTED_FOLDER_SUBJECT', self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on('E_CONFIRM_REMOVE_SELECTED_FOLDER_SUBJECT', function () {
            // delete folder
            angular.forEach(self._selectedFolderList, function (id) {
                self._folderService.deleteFolder(self._folderService.folderById(id), null, null)
            });
            self._selectedFolderList = [];
            // delete subject
            angular.forEach(self._selectedSubjectList, function (id) {
                var promise = self._subjectService.remove(self._subjectService.getById(id))
                promise.then(function(data){
                })
            });
            self._selectedSubjectList = [];

        });
    };

    private feedExercizer() {
        var self = this;
        // create folder
        var folderA = new Folder(null, null, null, null, 'A Folder');
        var folderB = new Folder(null, null, null, null, 'B Folder');
        var folderC = new Folder(null, null, null, null, 'C Folder');
        this._folderService.createFolder(folderA, null, null);
        this._folderService.createFolder(folderB, null, null);
        this._folderService.createFolder(folderC, null, null);
        // create subject
        var subject = new Subject(null, null, null, null, null, null, 'My Subject', 'My description', null, null, null, null);
        var promise = this._subjectService.persist(subject);
    }
}
