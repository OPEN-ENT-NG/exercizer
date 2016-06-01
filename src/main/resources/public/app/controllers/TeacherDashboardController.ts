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

    constructor($location,
                $scope,
                FolderService,
                SubjectService:ISubjectService) {
        var self = this;
        this._$location = $location;
        this._$scope = $scope;
        this._folderService = FolderService;
        this._subjectService = SubjectService;
        this._selectedSubjectList = [];
        this._selectedFolderList = [];
        this._eventsHandler(self);
        this.feedExercizer();
    }

    public createSubject = function(){
        this._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT", null);
    };

    private _eventsHandler = function (self) {

        self._$scope.$on("E_SELECT_FOLDER", function (event, folder) {
            self.toggleItem(folder.id, folder.selected, self._selectedFolderList);
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_TOASTER",  self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on("E_SELECT_SUBJECT", function (event, subject) {
            self.toggleItem(subject.id, subject.selected, self._selectedSubjectList);
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_TOASTER",  self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on("E_CREATE_FOLDER", function (event) {
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER", null);
        });

        self._$scope.$on("E_SCHEDULE_SUBJECT", function (event, subject) {
            self._$scope.$broadcast("E_DISPLAY_MODAL_SCHEDULE_SUBJECT", subject);
        });

        self._$scope.$on("E_EDIT_FOLDER", function (event, folder) {
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER", folder);
        });

        self._$scope.$on("E_COPY_SELECTED_FOLDER_SUBJECT", function (event) {
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE", self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on("E_EDIT_SUBJECT", function (event, subject) {
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT", subject);
        });

        self._$scope.$on("E_REMOVE_SELECTED_FOLDER_SUBJECT", function (event) {
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_REMOVE_SELECTED_FOLDER_SUBJECT", self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on("E_CONFIRM_REMOVE_SELECTED_FOLDER_SUBJECT", function (event) {
            // delete folder
            angular.forEach(self._selectedFolderList, function (id, key) {
                self._folderService.deleteFolder(self._folderService.folderById(id), null, null)
            });
            self._selectedFolderList = [];
            // delete subject
            angular.forEach(self._selectedSubjectList, function (id, key) {
                var promise = self._subjectService.remove(self._subjectService.getById(id));
                promise.then(function(data){
                })
            });
            self._selectedSubjectList = [];

        });

        self._$scope.$on("E_CONFIRM_COPY_PASTE", function (event, folder) {
            var folderParentId = folder ? folder.id : null;
            self.duplicateFolderList(self._selectedFolderList, folderParentId);
            self.duplicateSubjectList(self._selectedSubjectList, folderParentId);
        });
    };
    private duplicateSubjectList(list, folderParentId){
        console.log('duplicateSubjectList', list, folderParentId);
        var self = this;
        angular.forEach(list, function (subject, key) {
            var id;
            if(subject instanceof Subject){
                id = subject.id;
            } else{
                id = subject;
            }
            var promise = self._subjectService.duplicate(self._subjectService.getById(id));
            promise.then(function(data){
                data.folder_id = folderParentId;
            });
        });
    }

    private duplicateFolderList (list, folderParentId){
        var self = this;
        angular.forEach(list, function (folder, key) {
            var id;
            if(folder instanceof Folder){
                id = folder.id;
            } else{
                id = folder;
            }
            self._folderService.duplicateFolder(self._folderService.folderById(id),
                function(data){
                    // data is folder
                    if(folderParentId){
                        self._folderService.setParentFolderId(data.id, folderParentId);
                    }
                    // duplicate children folder
                    var childrenFolder = self._folderService.getListOfSubFolderByFolderId(id);
                    if(childrenFolder){
                        self.duplicateFolderList(childrenFolder, data.id);
                    }
                    // duplicate children subject
                    var childrenSubject = self._subjectService.getListByFolderId(id);
                    if(childrenSubject.length != 0){
                        console.log('have children subject', childrenSubject);
                        self.duplicateSubjectList(childrenSubject,data.id);
                    }
                }
            );

        });
    }




    private toggleItem(id, isSelected, list) {
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

    private feedExercizer() {

        var self = this;
        // create folder
        var folderA = new Folder(null, null, null, null, "A Folder");
        var folderB = new Folder(null, null, null, null, "B Folder");
        var folderC = new Folder(null, null, null, null, "C Folder");
        this._folderService.createFolder(folderA, null, null);
        this._folderService.createFolder(folderB, null, null);
        this._folderService.createFolder(folderC, null, null);
        // create subject
        var subject = new Subject(null, null, null, null, null, null, null, "My Subject", "My description", null, null, null, null);
        var promise = this._subjectService.persist(subject);
    }
}
