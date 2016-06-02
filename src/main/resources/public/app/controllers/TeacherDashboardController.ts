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
        // load subject;
        this._subjectService.loadSubjectList();
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
            self.resetSelectedSubjectList();
        });

        self._$scope.$on("E_EDIT_FOLDER", function (event, folder) {
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER", folder);
            self.resetSelectedFolderList();
        });

        self._$scope.$on("E_COPY_SELECTED_FOLDER_SUBJECT", function (event) {
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE", self._selectedSubjectList, self._selectedFolderList);
            // reset list in confirm
        });

        self._$scope.$on("E_EDIT_SUBJECT", function (event, subject) {
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT", subject);
            self.resetSelectedSubjectList();
        });

        self._$scope.$on("E_REMOVE_SELECTED_FOLDER_SUBJECT", function (event) {
            self._$scope.$broadcast("E_DISPLAY_DASHBOARD_MODAL_REMOVE_SELECTED_FOLDER_SUBJECT", self._selectedSubjectList, self._selectedFolderList);
            // reset list in confirm
        });

        self._$scope.$on("E_CONFIRM_REMOVE_SELECTED_FOLDER_SUBJECT", function (event) {
            // delete folder
            angular.forEach(self._selectedFolderList, function (id, key) {
                self._folderService.remove(self._folderService.folderById(id));
            });
            self.resetSelectedFolderList();
            // delete subject
            angular.forEach(self._selectedSubjectList, function (id, key) {
                var promise = self._subjectService.remove(self._subjectService.getById(id));
                promise.then(function(data){
                })
            });
            self.resetSelectedSubjectList();
        });

        self._$scope.$on("E_CONFIRM_COPY_PASTE", function (event, folder) {
            var folderParentId = folder ? folder.id : null;
            self.duplicateFolderList(self._selectedFolderList, folderParentId);
            self.duplicateSubjectList(self._selectedSubjectList, folderParentId);
            self.resetSelectedList();
        });
    };
    private duplicateSubjectList(list, folderParentId){
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
            if(id == folderParentId){
                console.error('try to duplicate a folder in itself');
                throw "";

            }
            self._folderService.duplicateFolder(self._folderService.folderById(id),
                function(data){
                    // ---
                    // data.id is the id of the folder created
                    // id is the id of the folder duplicated (origin)
                    // folderParentId is the folder where the folder is duplicate
                    // ---
                    // set parent folder id to the folder created
                    if(folderParentId){
                        self._folderService.setParentFolderId(data.id, folderParentId);
                    }
                    // get children folder of the folder duplicated
                    var childrenFolder = self._folderService.getListOfSubFolderByFolderId(id);
                    // we want to remove from this list the folder create just now
                    angular.forEach(childrenFolder, function(value){
                       console.log('value') ;
                    });
                    // if children exit , duplicate it
                    if(childrenFolder){
                        self.duplicateFolderList(childrenFolder, data.id);
                    }
                    // duplicate children subject of the folder duplicated
                    var childrenSubject = self._subjectService.getListByFolderId(id);
                    if(childrenSubject.length != 0){
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
                // force attribut selected in object
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

    private resetSelectedFolderList(){
        var self = this,
            folder;
        angular.forEach(self._selectedFolderList, function(id){
            folder = self._folderService.folderById(id) || null;
            if(folder !== null){
                folder.selected = false;
            }
        });
        this._selectedFolderList = [];
        self._$scope.$broadcast("E_DISPLAY_DASHBOARD_TOASTER",  self._selectedSubjectList, self._selectedFolderList);

    }
    private resetSelectedSubjectList(){
        var self = this,
            subject;
        angular.forEach(self._selectedSubjectList, function(id){
            subject = self._subjectService.getById(id) || null;
            if(subject !== null){
                subject.selected = false;
            }
        });
        this._selectedSubjectList = [];
        self._$scope.$broadcast("E_DISPLAY_DASHBOARD_TOASTER",  self._selectedSubjectList, self._selectedFolderList);

    }

    private resetSelectedList(){
        this.resetSelectedFolderList();
        this.resetSelectedSubjectList();
    }
}
